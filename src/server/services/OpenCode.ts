/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * OpenRouter AI provider: uses OpenRouter API (OpenAI-compatible) with
 * skill-embedded prompts that constrain the model to professional stock
 * analysis scope. Free models (Nemotron 3.5 Lightning, etc.) supported.
 * AI failures never block rules-based prediction.
 */

import { createHash } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { parseDeepSeek, type ParsedDeepSeekOutput } from '@app/server/services/prediction/parseDeepSeek.ts'
import type {
  FundamentalInput,
  IndicatorInput,
  PredictionAssetClass,
  PredictionStrategy,
  RuleOutput
} from '@app/server/services/prediction/rules.ts'

export const PROMPT_VERSION = 'openrouter-v1-0'

const DEFAULT_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10
const REQUEST_TIMEOUT_MS = 60_000
// Free models have $0 cost.
const COST_PER_1M_INPUT = 0
const COST_PER_1M_OUTPUT = 0

export type OpenCodeAnalysisStatus = 'success' | 'failed' | 'cached' | 'skipped'

export type OpenCodeAnalysisResult = {
  status: OpenCodeAnalysisStatus
  model: string
  promptVersion: string
  summary: string | null
  parsed: ParsedDeepSeekOutput
  runId: string | null
  errorMessage: string | null
  tokens: { promptTokens: number; completionTokens: number } | null
  estimatedCostUsd: number | null
}

export type OpenCodeAnalyzeInput = {
  symbol: string
  assetClass: PredictionAssetClass
  strategy: PredictionStrategy
  entryPrice: number
  ruleOutput: RuleOutput
  closes: number[]
  fundamentals: FundamentalInput | null
  indicators: IndicatorInput | null
  predictionId?: string
}

type OpenCodeChatResponse = {
  choices?: { message?: { content?: string } }[]
  usage?: { prompt_tokens?: number; completion_tokens?: number }
}

const requestTimestamps: number[] = []

function rateLimitAllows(): boolean {
  const now = Date.now()
  while (requestTimestamps.length > 0 && now - requestTimestamps[0]! > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift()
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  requestTimestamps.push(now)
  return true
}

export function buildPayloadHash(input: OpenCodeAnalyzeInput): string {
  const canonical = JSON.stringify({
    symbol: input.symbol,
    assetClass: input.assetClass,
    strategy: input.strategy,
    entryPrice: input.entryPrice,
    promptVersion: PROMPT_VERSION,
    closes: input.closes,
    fundamentals: input.fundamentals,
    indicators: input.indicators,
    ruleOutput: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  })
  return createHash('sha256').update(canonical).digest('hex')
}

function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`
}

/**
 * Builds the system prompt with embedded trading-analysis skill rules.
 * The skill constrains the AI to professional stock/forex analysis scope:
 * - Institutional-grade technical analysis
 * - Risk management and position sizing
 * - Entry/exit criteria with stop-loss discipline
 * - Mandatory disclaimers
 * - Strict JSON output contract
 */
export function buildOpenCodePrompt(input: OpenCodeAnalyzeInput): {
  system: string
  user: string
} {
  const isStock = input.assetClass === 'stock'
  const isIntraday = input.strategy === 'scalping_hourly' || input.strategy === 'scalping_minutes'

  const system = [
    'You are a disciplined trading-analysis assistant for the IDX + Forex AI Screener.',
    '',
    '## Scope Rules (trading-analysis skill)',
    'You MUST stay within professional stock and forex analysis scope.',
    'You are NOT permitted to:',
    '- Generate code, scripts, or programming solutions',
    '- Discuss topics unrelated to financial markets',
    '- Provide general knowledge or trivia',
    '- Act as a general-purpose chatbot',
    '',
    'You ARE permitted to:',
    '- Analyze technical indicators (RSI, MACD, Moving Averages, Bollinger Bands, ATR)',
    '- Evaluate fundamental metrics (PER, PBV, ROE, ROA, DER, market cap)',
    '- Assess market conditions and volatility',
    '- Provide entry/exit recommendations with risk management',
    '- Identify support/resistance levels',
    '- Discuss sector rotation and market sentiment',
    '',
    '## Analysis Framework',
    isStock
      ? 'The instrument is an Indonesian equity. Use its fundamentals (PER, PBV, ROE, ROA, DER, market cap, revenue, sector, corporate-action flags) together with price technicals.'
      : 'The instrument is a forex pair or precious metal. Use price technicals and volatility only; there are no equity fundamentals.',
    `The trader's strategy is "${input.strategy}" (scalping: intraday-to-days, swing: days-to-weeks, long_term: weeks-to-months).`,
    isIntraday
      ? 'For intraday strategies, focus on short-term momentum, mean-reversion signals, and quick scalp opportunities. Tighter stops and targets are expected.'
      : '',
    'You are given rule-engine output; critically compare it with your own read. Disagree where the data supports it.',
    '',
    '## Output Contract',
    'Respond with STRICT JSON only — no markdown fences, no prose outside the JSON object. Schema:',
    '{"label":"bullish|neutral|bearish","bullishProbability":0-100,"targetPrice":number,"stopLoss":number,"horizonDays":integer,"reasons":["..."],"riskWarnings":["..."],"confidenceScore":0-100,"disclaimer":"..."}',
    '',
    '## Directional Pricing',
    '- If label is "bullish": targetPrice must be ABOVE entry, stopLoss BELOW entry (long position)',
    '- If label is "bearish": targetPrice must be BELOW entry, stopLoss ABOVE entry (short position)',
    '- If label is "neutral": provide the most likely directional move with corresponding target/stop',
    `- The rule engine's current entry price is ${input.entryPrice}.`,
    '',
    '## Risk Management Rules',
    '- Stop loss MUST be defined for every recommendation',
    '- Risk-reward ratio should be at least 1:2 for swing trades, 1:1.5 for scalps',
    '- Never recommend risking more than 2% of portfolio on a single position',
    '- Consider position sizing based on account risk tolerance',
    '',
    '## Disclaimer Requirement',
    'The disclaimer must state that this is analysis support, not guaranteed profit or financial advice.',
    'Always remind the user that past performance does not guarantee future results.'
  ].filter((line) => line !== '').join('\n')

  const user = JSON.stringify({
    instrument: {
      symbol: input.symbol,
      assetClass: input.assetClass,
      strategy: input.strategy,
      entryPrice: input.entryPrice
    },
    ...(input.fundamentals != null ? { fundamentals: input.fundamentals } : {}),
    technicals: {
      closes: input.closes.slice(-90),
      rsi14: input.indicators?.rsi14 ?? null,
      ema20: input.indicators?.ema20 ?? null,
      ema50: input.indicators?.ema50 ?? null,
      ema200: input.indicators?.ema200 ?? null,
      atrPct: input.indicators?.atrPct ?? null,
      realizedVolPct: input.indicators?.realizedVolPct ?? null,
      return20Pct: input.indicators?.return20Pct ?? null
    },
    ruleEngine: {
      horizonDays: input.ruleOutput.horizonDays,
      targetPrice: input.ruleOutput.targetPrice,
      stopLoss: input.ruleOutput.stopLoss,
      bullishProbability: input.ruleOutput.bullishProbability,
      confidenceScore: input.ruleOutput.confidenceScore,
      ruleScore: input.ruleOutput.ruleScore,
      riskNotes: input.ruleOutput.riskNotes
    }
  })
  return { system, user }
}

export class OpenCode {
  static async analyze(input: OpenCodeAnalyzeInput): Promise<OpenCodeAnalysisResult> {
    const apiKey = process.env['OPENROUTER_API_KEY'] ?? process.env['OPENCODE_API_KEY']
    const model = process.env['OPENCODE_MODEL'] ?? 'nvidia/nemotron-3.5-lightning:free'
    const endpoint = process.env['OPENCODE_API_ENDPOINT'] ?? DEFAULT_ENDPOINT
    if (apiKey == null || apiKey.trim() === '') {
      return {
        status: 'skipped',
        model,
        promptVersion: PROMPT_VERSION,
        summary: null,
        parsed: parseDeepSeek(null),
        runId: null,
        errorMessage: 'OPENROUTER_API_KEY is not configured',
        tokens: null,
        estimatedCostUsd: null
      }
    }

    const inputHash = buildPayloadHash(input)
    const cached = await OpenCode.findCachedRun(inputHash)
    if (cached != null && cached.responseSummary != null) {
      const run = await OpenCode.recordRun(input, {
        status: 'cached',
        inputHash,
        responseSummary: cached.responseSummary,
        metadata: { cachedFrom: cached.id }
      })
      return {
        status: 'cached',
        model,
        promptVersion: PROMPT_VERSION,
        summary: cached.responseSummary,
        parsed: parseDeepSeek(cached.responseSummary),
        runId: run?.id ?? null,
        errorMessage: null,
        tokens: null,
        estimatedCostUsd: null
      }
    }

    if (!rateLimitAllows()) {
      const run = await OpenCode.recordRun(input, {
        status: 'failed',
        inputHash,
        errorMessage: 'rate limit exceeded'
      })
      return {
        status: 'failed',
        model,
        promptVersion: PROMPT_VERSION,
        summary: null,
        parsed: parseDeepSeek(null),
        runId: run?.id ?? null,
        errorMessage: 'Rate limit exceeded. Try again in a minute.',
        tokens: null,
        estimatedCostUsd: null
      }
    }

    const { system, user } = buildOpenCodePrompt(input)
    let content: string | null = null
    let tokens: { promptTokens: number; completionTokens: number } | null = null
    let errorMessage: string | null = null
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://idx-screener.neabyte.com',
          'X-Title': 'IDX Screener'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          temperature: 0.2
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
      if (!response.ok) {
        errorMessage = `OpenCode API ${response.status}`
      } else {
        const json = (await response.json()) as OpenCodeChatResponse
        content = json.choices?.[0]?.message?.content?.trim() ?? null
        tokens = {
          promptTokens: json.usage?.prompt_tokens ?? 0,
          completionTokens: json.usage?.completion_tokens ?? 0
        }
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error)
    }

    const status: OpenCodeAnalysisStatus = content != null ? 'success' : 'failed'
    const estimatedCostUsd =
      tokens != null
        ? (tokens.promptTokens / 1_000_000) * COST_PER_1M_INPUT +
          (tokens.completionTokens / 1_000_000) * COST_PER_1M_OUTPUT
        : null
    const run = await OpenCode.recordRun(input, {
      status,
      inputHash,
      responseSummary: content != null ? truncate(content, 8000) : null,
      errorMessage,
      metadata: { tokens, estimatedCostUsd }
    })
    return {
      status,
      model,
      promptVersion: PROMPT_VERSION,
      summary: content,
      parsed: parseDeepSeek(content),
      runId: run?.id ?? null,
      errorMessage,
      tokens,
      estimatedCostUsd
    }
  }

  private static async findCachedRun(inputHash: string) {
    const rows = await Database.select()
      .from(Schemas.aiAnalysisRuns)
      .where(
        and(
          eq(Schemas.aiAnalysisRuns.inputHash, inputHash),
          eq(Schemas.aiAnalysisRuns.status, 'success'),
          eq(Schemas.aiAnalysisRuns.provider, 'opencode')
        )
      )
      .orderBy(desc(Schemas.aiAnalysisRuns.createdAt))
      .limit(1)
    const run = rows[0]
    if (run == null || run.responseSummary == null) {
      return null
    }
    const createdAtMs = new Date(run.createdAt).getTime()
    if (Date.now() - createdAtMs > CACHE_TTL_MS) {
      return null
    }
    return run
  }

  private static async recordRun(
    input: OpenCodeAnalyzeInput,
    run: {
      status: OpenCodeAnalysisStatus
      inputHash: string
      responseSummary?: string | null
      errorMessage?: string | null
      metadata?: Record<string, unknown>
    }
  ) {
    const inserted = await Database.insert(Schemas.aiAnalysisRuns)
      .values({
        predictionId: input.predictionId ?? null,
        symbol: input.symbol,
        assetClass: input.assetClass,
        strategy: input.strategy,
        provider: 'opencode',
        model: process.env['OPENCODE_MODEL'] ?? 'nvidia/nemotron-3.5-lightning:free',
        promptVersion: PROMPT_VERSION,
        status: run.status,
        inputHash: run.inputHash,
        responseSummary: run.responseSummary ?? null,
        errorMessage: run.errorMessage ?? null,
        metadata: run.metadata ?? {}
      })
      .returning()
    return inserted[0] ?? null
  }

  static async recentRuns(filters: {
    symbol?: string
    assetClass?: string
    limit?: number
  }) {
    const conditions = [eq(Schemas.aiAnalysisRuns.provider, 'opencode')]
    if (filters.symbol != null && filters.symbol !== '') {
      conditions.push(eq(Schemas.aiAnalysisRuns.symbol, filters.symbol))
    }
    if (filters.assetClass != null && filters.assetClass !== '') {
      conditions.push(eq(Schemas.aiAnalysisRuns.assetClass, filters.assetClass))
    }
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100)
    return await Database.select()
      .from(Schemas.aiAnalysisRuns)
      .where(and(...conditions))
      .orderBy(desc(Schemas.aiAnalysisRuns.createdAt))
      .limit(limit)
  }
}
