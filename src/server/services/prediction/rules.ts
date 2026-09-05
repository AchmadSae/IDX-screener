/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Rules-v2 prediction engine. `computeRulePrediction` is a pure function:
 * same input always produces the same output, so it can be regression-tested
 * with fixtures. The v1 base sizes remain as floors; volatility-aware ATR
 * sizing only widens targets/stops when the market is noisier than the base.
 */

import { round2, clamp } from '@app/server/services/prediction/numbers.ts'

export type PredictionStrategy = 'scalping' | 'swing' | 'long_term'
export type PredictionAssetClass = 'stock' | 'forex' | 'metal'

export type FundamentalInput = {
  roe: number | null
  der: number | null
  per: number | null
  week13PC: number | null
  week26PC: number | null
}

export type IndicatorInput = {
  price: number | null
  rsi14: number | null
  ema20: number | null
  ema50: number | null
  ema200: number | null
  atrPct: number | null
  realizedVolPct: number | null
  return20Pct: number | null
  /** Number of daily bars used to compute the indicators. */
  barCount: number
}

export type RuleInput = {
  symbol: string
  assetClass: PredictionAssetClass
  strategy: PredictionStrategy
  entryPrice: number
  fundamentals: FundamentalInput | null
  indicators: IndicatorInput | null
}

export type RuleOutput = {
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

const HORIZON_BY_STRATEGY: Record<PredictionStrategy, number> = {
  scalping: 1,
  swing: 14,
  long_term: 90
}

/** Base target moves (%), the v1 defaults that stay as floors. */
const BASE_MOVE: Record<PredictionStrategy, number> = {
  scalping: 1.2,
  swing: 4.5,
  long_term: 12
}

/** Base stop distances (%), the v1 defaults that stay as floors. */
const BASE_STOP: Record<PredictionStrategy, number> = {
  scalping: 0.6,
  swing: 2.2,
  long_term: 5.5
}

/** ATR multipliers for targets: target = max(base, atrPct * mult). */
const ATR_MULT: Record<PredictionStrategy, number> = {
  scalping: 0.6,
  swing: 2.0,
  long_term: 7.0
}

/** ATR multipliers for stops: stop = max(base, atrPct * mult). */
const STOP_MULT: Record<PredictionStrategy, number> = {
  scalping: 0.5,
  swing: 1.0,
  long_term: 2.5
}

export function horizonFor(strategy: PredictionStrategy): number {
  return HORIZON_BY_STRATEGY[strategy]
}

/**
 * Scores a stock from fundamentals plus technical inputs. Returns a list of
 * score deltas; the sum is clamped to 5-95 later.
 */
function stockDeltas(
  strategy: PredictionStrategy,
  fundamentals: FundamentalInput | null,
  indicators: IndicatorInput | null,
  riskNotes: string[]
): number[] {
  const deltas: number[] = []
  if (fundamentals != null) {
    if ((fundamentals.roe ?? 0) >= 15) {
      deltas.push(12)
    } else {
      riskNotes.push('ROE below preferred threshold')
    }
    if ((fundamentals.der ?? 99) <= 0.8) {
      deltas.push(8)
    } else {
      riskNotes.push('DER above preferred threshold')
    }
    if ((fundamentals.per ?? 999) >= 3 && (fundamentals.per ?? 999) <= 18) {
      deltas.push(8)
    } else {
      riskNotes.push('PER outside value range')
    }
    const momentum = strategy === 'long_term' ? fundamentals.week26PC : fundamentals.week13PC
    if ((momentum ?? 0) > 0) {
      deltas.push(10)
    } else {
      riskNotes.push('Momentum is not supportive')
    }
  }
  if (indicators != null) {
    if (indicators.price != null && indicators.ema20 != null && indicators.price > indicators.ema20) {
      deltas.push(6)
    }
    if (indicators.ema20 != null && indicators.ema50 != null && indicators.ema20 > indicators.ema50) {
      deltas.push(4)
    }
    if (indicators.rsi14 != null && indicators.rsi14 >= 40 && indicators.rsi14 <= 70) {
      deltas.push(3)
    }
    if (indicators.rsi14 != null && indicators.rsi14 > 78) {
      deltas.push(-5)
      riskNotes.push('RSI overbought')
    }
    if (
      strategy === 'long_term' &&
      indicators.price != null &&
      indicators.ema200 != null &&
      indicators.price < indicators.ema200
    ) {
      deltas.push(-8)
      riskNotes.push('Price below EMA200 (structural downtrend)')
    }
  }
  if (fundamentals == null && indicators == null) {
    riskNotes.push('Insufficient data for technical scoring')
  }
  return deltas
}

/**
 * Scores forex/metals from technical inputs only (no fundamentals).
 */
function forexDeltas(indicators: IndicatorInput | null, riskNotes: string[]): number[] {
  const deltas: number[] = []
  if (indicators != null && indicators.ema20 != null && indicators.ema50 != null) {
    if (indicators.ema20 > indicators.ema50) {
      deltas.push(10)
    } else if (indicators.ema20 < indicators.ema50) {
      deltas.push(-10)
      riskNotes.push('EMA20 below EMA50 (short-term downtrend)')
    }
  }
  if (indicators?.rsi14 != null) {
    if (indicators.rsi14 >= 40 && indicators.rsi14 <= 65) {
      deltas.push(4)
    } else if (indicators.rsi14 > 75) {
      deltas.push(-4)
      riskNotes.push('RSI overbought')
    }
  }
  if (indicators?.return20Pct != null) {
    if (indicators.return20Pct > 0) {
      deltas.push(6)
    } else if (indicators.return20Pct < 0) {
      deltas.push(-6)
      riskNotes.push('20-bar return negative')
    }
  }
  if (
    indicators == null ||
    indicators.ema20 == null ||
    indicators.ema50 == null ||
    indicators.rsi14 == null
  ) {
    riskNotes.push('Insufficient price history for technical scoring')
  }
  return deltas
}

export function computeRulePrediction(input: RuleInput): RuleOutput {
  const { symbol, assetClass, strategy, entryPrice } = input
  const riskNotes: string[] = []

  const deltas =
    assetClass === 'stock'
      ? stockDeltas(strategy, input.fundamentals, input.indicators, riskNotes)
      : forexDeltas(input.indicators, riskNotes)

  const score = clamp(50 + deltas.reduce((sum, value) => sum + value, 0), 5, 95)
  const bullishProbability = round2(score)

  const atrPct = input.indicators?.atrPct ?? null
  let targetMovePct = BASE_MOVE[strategy]
  let stopMovePct = BASE_STOP[strategy]
  if (atrPct != null && Number.isFinite(atrPct) && atrPct > 0) {
    targetMovePct = Math.max(targetMovePct, atrPct * ATR_MULT[strategy])
    stopMovePct = Math.max(stopMovePct, atrPct * STOP_MULT[strategy])
    riskNotes.push(`ATR-based sizing (ATR ~${round2(atrPct)}% of price)`)
  } else {
    riskNotes.push('Default sizing - volatility data unavailable')
  }
  // Safety: a stop can never sit beyond the target.
  if (stopMovePct > targetMovePct) {
    stopMovePct = targetMovePct
  }

  let confidenceScore = 45
  if (assetClass === 'stock') {
    confidenceScore =
      input.fundamentals != null && input.indicators != null && input.indicators.barCount >= 60
        ? 68
        : 45
  } else if (input.indicators != null && input.indicators.barCount >= 60) {
    confidenceScore = 55
  } else {
    confidenceScore = 40
  }

  return {
    horizonDays: horizonFor(strategy),
    entryPrice,
    targetPrice: round2(entryPrice * (1 + targetMovePct / 100)),
    stopLoss: round2(entryPrice * (1 - stopMovePct / 100)),
    bullishProbability,
    confidenceScore,
    ruleScore: bullishProbability,
    riskNotes,
    metadata: {
      ruleVersion: 'rules-v2',
      symbol,
      assetClass,
      strategy,
      inputs: {
        rsi14: input.indicators?.rsi14 ?? null,
        ema20: input.indicators?.ema20 ?? null,
        ema50: input.indicators?.ema50 ?? null,
        ema200: input.indicators?.ema200 ?? null,
        atrPct: input.indicators?.atrPct ?? null,
        realizedVolPct: input.indicators?.realizedVolPct ?? null,
        return20Pct: input.indicators?.return20Pct ?? null,
        barCount: input.indicators?.barCount ?? 0
      }
    }
  }
}
