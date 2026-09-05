import { desc, eq } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'

export type PredictionStrategy = 'scalping' | 'swing' | 'long_term'
export type PredictionAssetClass = 'stock' | 'forex' | 'metal'

export type CreatePredictionInput = {
  symbol: string
  assetClass?: PredictionAssetClass
  strategy?: PredictionStrategy
  currentPrice?: number
  useDeepSeek?: boolean
}

type RulePrediction = {
  horizonDays: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  bullishProbability: number
  confidenceScore: number
  ruleScore: number
  riskNotes: string[]
  metadata: Record<string, unknown>
}

type DeepSeekResult = {
  aiScore: number | null
  aiSummary: string | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\s+/g, '')
}

function parseStrategy(raw: string | undefined): PredictionStrategy {
  if (raw === 'scalping' || raw === 'swing' || raw === 'long_term') {
    return raw
  }
  return 'swing'
}

function parseAssetClass(raw: string | undefined, symbol: string): PredictionAssetClass {
  if (raw === 'stock' || raw === 'forex' || raw === 'metal') {
    return raw
  }
  if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) {
    return 'metal'
  }
  if (symbol.includes('/')) {
    return 'forex'
  }
  return 'stock'
}

function horizonFor(strategy: PredictionStrategy): number {
  if (strategy === 'scalping') {
    return 1
  }
  if (strategy === 'long_term') {
    return 90
  }
  return 14
}

function targetMoveFor(strategy: PredictionStrategy, probability: number): number {
  const base = strategy === 'scalping' ? 0.012 : strategy === 'long_term' ? 0.12 : 0.045
  return base * (0.75 + probability / 200)
}

async function latestStockSnapshot(symbol: string): Promise<{
  entryPrice: number | null
  roe: number | null
  der: number | null
  per: number | null
  week13PC: number | null
  week26PC: number | null
  sector: string | null
}> {
  const latestSummary = await Database.select({
    priceClose: Schemas.summary.priceClose
  })
    .from(Schemas.summary)
    .where(eq(Schemas.summary.stockCode, symbol))
    .orderBy(desc(Schemas.summary.date))
    .limit(1)

  const screenerRows = await Database.select({
    roe: Schemas.screener.roe,
    der: Schemas.screener.der,
    per: Schemas.screener.per,
    week13PC: Schemas.screener.week13PC,
    week26PC: Schemas.screener.week26PC,
    sector: Schemas.screener.sector
  })
    .from(Schemas.screener)
    .where(eq(Schemas.screener.code, symbol))
    .limit(1)

  const screener = screenerRows[0]
  return {
    entryPrice: latestSummary[0]?.priceClose ?? null,
    roe: screener?.roe ?? null,
    der: screener?.der ?? null,
    per: screener?.per ?? null,
    week13PC: screener?.week13PC ?? null,
    week26PC: screener?.week26PC ?? null,
    sector: screener?.sector ?? null
  }
}

function computeRulePrediction(
  strategy: PredictionStrategy,
  assetClass: PredictionAssetClass,
  entryPrice: number,
  snapshot: Awaited<ReturnType<typeof latestStockSnapshot>> | null
): RulePrediction {
  let score = 50
  const riskNotes: string[] = []

  if (assetClass === 'stock' && snapshot != null) {
    if ((snapshot.roe ?? 0) >= 15) {
      score += 12
    } else {
      riskNotes.push('ROE below preferred threshold')
    }
    if ((snapshot.der ?? 99) <= 0.8) {
      score += 8
    } else {
      riskNotes.push('DER above preferred threshold')
    }
    if ((snapshot.per ?? 999) >= 3 && (snapshot.per ?? 999) <= 18) {
      score += 8
    } else {
      riskNotes.push('PER outside value range')
    }
    if ((strategy === 'long_term' ? snapshot.week26PC : snapshot.week13PC) ?? 0 > 0) {
      score += 10
    } else {
      riskNotes.push('Momentum is not supportive')
    }
  } else {
    score += strategy === 'scalping' ? 4 : 0
    riskNotes.push('Forex/metals prediction uses price-only MVP rules until provider OHLC is connected')
  }

  const bullishProbability = round2(clamp(score, 5, 95))
  const targetMove = targetMoveFor(strategy, bullishProbability)
  const stopMove = strategy === 'scalping' ? 0.006 : strategy === 'long_term' ? 0.055 : 0.022

  return {
    horizonDays: horizonFor(strategy),
    entryPrice,
    targetPrice: round2(entryPrice * (1 + targetMove)),
    stopLoss: round2(entryPrice * (1 - stopMove)),
    bullishProbability,
    confidenceScore: round2(assetClass === 'stock' && snapshot != null ? 68 : 45),
    ruleScore: bullishProbability,
    riskNotes,
    metadata: {
      snapshot,
      ruleVersion: 'rules-v1'
    }
  }
}

async function runDeepSeek(
  symbol: string,
  assetClass: PredictionAssetClass,
  strategy: PredictionStrategy,
  rulePrediction: RulePrediction
): Promise<DeepSeekResult> {
  const apiKey = process.env['DEEPSEEK_API_KEY']
  if (apiKey == null || apiKey.trim() === '') {
    return { aiScore: null, aiSummary: null }
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env['DEEPSEEK_MODEL'] ?? 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            'You are a trading analysis assistant. Return concise risk-aware analysis, not financial guarantees.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            symbol,
            assetClass,
            strategy,
            rulePrediction
          })
        }
      ],
      temperature: 0.2
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API ${response.status}`)
  }

  const json = await response.json() as {
    choices?: { message?: { content?: string } }[]
  }
  const summary = json.choices?.[0]?.message?.content?.trim() ?? null
  return {
    aiScore: summary == null ? null : rulePrediction.bullishProbability,
    aiSummary: summary
  }
}

export class Prediction {
  static async create(input: CreatePredictionInput) {
    const symbol = normalizeSymbol(input.symbol)
    if (symbol === '') {
      throw new Error('symbol is required')
    }

    const strategy = parseStrategy(input.strategy)
    const assetClass = parseAssetClass(input.assetClass, symbol)
    const snapshot = assetClass === 'stock' ? await latestStockSnapshot(symbol) : null
    const entryPrice = input.currentPrice ?? snapshot?.entryPrice

    if (entryPrice == null || !Number.isFinite(entryPrice) || entryPrice <= 0) {
      throw new Error('currentPrice is required when no stored latest price is available')
    }

    const rulePrediction = computeRulePrediction(strategy, assetClass, entryPrice, snapshot)
    let deepSeek: DeepSeekResult = { aiScore: null, aiSummary: null }

    if (input.useDeepSeek === true) {
      try {
        deepSeek = await runDeepSeek(symbol, assetClass, strategy, rulePrediction)
      } catch (error) {
        deepSeek = {
          aiScore: null,
          aiSummary: `DeepSeek analysis unavailable: ${error instanceof Error ? error.message : String(error)}`
        }
      }
    }

    const inserted = await Database.insert(Schemas.predictions)
      .values({
        symbol,
        assetClass,
        strategy,
        horizonDays: rulePrediction.horizonDays,
        entryPrice: rulePrediction.entryPrice,
        targetPrice: rulePrediction.targetPrice,
        stopLoss: rulePrediction.stopLoss,
        bullishProbability: rulePrediction.bullishProbability,
        confidenceScore: rulePrediction.confidenceScore,
        ruleScore: rulePrediction.ruleScore,
        aiScore: deepSeek.aiScore,
        aiSummary: deepSeek.aiSummary,
        riskNotes: rulePrediction.riskNotes,
        metadata: rulePrediction.metadata
      })
      .returning()

    return inserted[0]
  }

  static async history(limit = 50) {
    return await Database.select()
      .from(Schemas.predictions)
      .orderBy(desc(Schemas.predictions.createdAt))
      .limit(clamp(limit, 1, 200))
  }
}

export default Prediction
