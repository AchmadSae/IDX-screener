/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { DeepSeek } from '@app/server/services/DeepSeek.ts'
import { OpenCode } from '@app/server/services/OpenCode.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'
import {
  normalizeSymbol,
  parseAssetClass,
  parseStrategy,
  SUPPORTED_FOREX_METALS
} from '@app/server/services/Prediction.ts'
import { assembleRuleInput } from '@app/server/services/prediction/inputs.ts'
import {
  computeRulePrediction,
  type PredictionAssetClass,
  type PredictionStrategy
} from '@app/server/services/prediction/rules.ts'
import { ApiError } from '@app/server/http/errors.ts'

async function parseBody(
  body: unknown
): Promise<{ symbol: string; assetClass: PredictionAssetClass; strategy: PredictionStrategy }> {
  const record = (body ?? {}) as Record<string, unknown>
  const symbol = normalizeSymbol(String(record.symbol ?? ''))
  if (symbol === '') {
    throw ApiError.badRequest('ANALYSIS_INPUT_ERROR', 'symbol is required')
  }
  const strategy = parseStrategy(
    record.strategy != null && record.strategy !== '' ? String(record.strategy) : undefined
  )
  const assetClass = parseAssetClass(
    record.assetClass != null && record.assetClass !== '' ? String(record.assetClass) : undefined,
    symbol
  )
  if (assetClass !== 'stock' && !(await InstrumentService.isKnown(symbol))) {
    throw ApiError.badRequest(
      'UNKNOWN_INSTRUMENT',
      `unknown instrument "${symbol}". Supported forex/metals: ${SUPPORTED_FOREX_METALS.join(', ')}`
    )
  }
  return { symbol, assetClass, strategy }
}

/**
 * POST /api/analyses — runs the rules engine + AI provider for an instrument
 * WITHOUT persisting a prediction. The run itself is stored in
 * ai_analysis_runs (predictionId null).
 */
export async function POST(ctx: Context): Promise<void> {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const { symbol, assetClass, strategy } = await parseBody(body)
  const currentPrice =
    body.currentPrice != null && body.currentPrice !== ''
      ? Number(body.currentPrice)
      : undefined
  const provider = (body.aiProvider as 'deepseek' | 'opencode') ?? 'opencode'

  const assembled = await assembleRuleInput(symbol, assetClass, strategy, currentPrice)
  const rulePrediction = computeRulePrediction(assembled.ruleInput)

  const analyzeInput = {
    symbol,
    assetClass,
    strategy,
    entryPrice: assembled.ruleInput.entryPrice,
    ruleOutput: rulePrediction,
    closes: assembled.closes,
    fundamentals: assembled.ruleInput.fundamentals,
    indicators: assembled.ruleInput.indicators
  }

  const result = provider === 'opencode'
    ? await OpenCode.analyze(analyzeInput)
    : await DeepSeek.analyze(analyzeInput)

  ctx.send.json({
    data: {
      runId: result.runId,
      symbol,
      assetClass,
      strategy,
      promptVersion: result.promptVersion,
      model: result.model,
      status: result.status,
      rulePrediction: {
        entryPrice: rulePrediction.entryPrice,
        targetPrice: rulePrediction.targetPrice,
        stopLoss: rulePrediction.stopLoss,
        bullishProbability: rulePrediction.bullishProbability,
        confidenceScore: rulePrediction.confidenceScore,
        ruleScore: rulePrediction.ruleScore,
        horizonDays: rulePrediction.horizonDays,
        riskNotes: rulePrediction.riskNotes,
        metadata: rulePrediction.metadata
      },
      aiResult: result.parsed,
      aiSummary: result.summary,
      errorMessage: result.errorMessage,
      tokens: result.tokens,
      estimatedCostUsd: result.estimatedCostUsd
    }
  })
}

/**
 * GET /api/analyses?symbol=&assetClass=&provider=&limit= — recent AI analysis runs.
 */
export async function GET(ctx: Context): Promise<void> {
  const symbol = ctx.query('symbol')
  const assetClass = ctx.query('assetClass')
  const provider = ctx.query('provider') as 'deepseek' | 'opencode' | undefined
  const limitRaw = ctx.query('limit')
  const limit = limitRaw !== undefined && limitRaw !== '' ? Number(limitRaw) : 20

  const runs = provider === 'opencode'
    ? await OpenCode.recentRuns({
        symbol: symbol != null ? symbol.trim().toUpperCase() : undefined,
        assetClass: assetClass ?? undefined,
        limit: Number.isFinite(limit) ? limit : 20
      })
    : await DeepSeek.recentRuns({
        symbol: symbol != null ? symbol.trim().toUpperCase() : undefined,
        assetClass: assetClass ?? undefined,
        limit: Number.isFinite(limit) ? limit : 20
      })

  ctx.send.json({ data: runs })
}
