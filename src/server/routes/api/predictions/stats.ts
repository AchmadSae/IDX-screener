/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { OutcomeEvaluationJob } from '@app/server/jobs/OutcomeEvaluationJob.ts'

type StrategyStats = {
  strategy: string
  count: number
  settledCount: number
  winRate: number | null
  avgReturn: number | null
  avgDrawdown: number | null
}

type AssetClassStats = {
  assetClass: string
  count: number
  settledCount: number
  winRate: number | null
  avgReturn: number | null
  avgDrawdown: number | null
}

type CalibrationBucket = {
  bucket: string
  count: number
  winRate: number | null
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}

function meanOrNull(values: number[]): number | null {
  if (values.length === 0) {
    return null
  }
  return round4(values.reduce((sum, value) => sum + value, 0) / values.length)
}

/**
 * GET /api/predictions/stats — win rate, average return, average drawdown
 * overall and by strategy/asset class, plus bullish-probability calibration
 * buckets. Triggers lazy outcome evaluation first.
 */
export async function GET(ctx: Context): Promise<void> {
  await OutcomeEvaluationJob.run()

  const predictions = await Database.select({
    id: Schemas.predictions.id,
    strategy: Schemas.predictions.strategy,
    assetClass: Schemas.predictions.assetClass,
    status: Schemas.predictions.status,
    bullishProbability: Schemas.predictions.bullishProbability
  }).from(Schemas.predictions)

  const outcomes = await Database.select({
    predictionId: Schemas.predictionOutcomes.predictionId,
    returnPercent: Schemas.predictionOutcomes.returnPercent,
    maxAdverseExcursion: Schemas.predictionOutcomes.maxAdverseExcursion
  }).from(Schemas.predictionOutcomes)

  const outcomeByPredictionId = new Map(
    outcomes.map((outcome) => [outcome.predictionId, outcome])
  )

  const counts = { total: predictions.length, open: 0, won: 0, lost: 0, expired: 0 }
  const settled = predictions.filter((prediction) => {
    if (prediction.status === 'open') {
      counts.open++
      return false
    }
    counts[prediction.status as 'won' | 'lost' | 'expired']++
    return outcomeByPredictionId.has(prediction.id)
  })

  const settledReturns: number[] = []
  const settledDrawdowns: number[] = []
  const byStrategy = new Map<string, { returns: number[]; drawdowns: number[]; wonLost: { won: number; lost: number } }>()
  const byAssetClass = new Map<string, { returns: number[]; drawdowns: number[]; wonLost: { won: number; lost: number } }>()
  const buckets = new Map<number, { won: number; lost: number }>()

  for (const prediction of settled) {
    const outcome = outcomeByPredictionId.get(prediction.id)
    if (outcome == null) {
      continue
    }
    settledReturns.push(outcome.returnPercent)
    if (outcome.maxAdverseExcursion != null) {
      settledDrawdowns.push(Math.abs(outcome.maxAdverseExcursion))
    }
    for (const [map, key] of [
      [byStrategy, prediction.strategy],
      [byAssetClass, prediction.assetClass]
    ] as const) {
      const entry = map.get(key) ?? { returns: [], drawdowns: [], wonLost: { won: 0, lost: 0 } }
      entry.returns.push(outcome.returnPercent)
      if (outcome.maxAdverseExcursion != null) {
        entry.drawdowns.push(Math.abs(outcome.maxAdverseExcursion))
      }
      if (prediction.status === 'won') {
        entry.wonLost.won++
      } else if (prediction.status === 'lost') {
        entry.wonLost.lost++
      }
      map.set(key, entry)
    }
    if (prediction.status === 'won' || prediction.status === 'lost') {
      const bucketIndex = Math.min(Math.floor(prediction.bullishProbability / 10), 9)
      const bucket = buckets.get(bucketIndex) ?? { won: 0, lost: 0 }
      if (prediction.status === 'won') {
        bucket.won++
      } else {
        bucket.lost++
      }
      buckets.set(bucketIndex, bucket)
    }
  }

  const decidedCount = counts.won + counts.lost
  const winRate = decidedCount > 0 ? round4(counts.won / decidedCount) : null
  const overall = {
    winRate,
    avgReturn: meanOrNull(settledReturns),
    avgDrawdown: meanOrNull(settledDrawdowns),
    settledCount: settled.length
  }

  const strategyStats: StrategyStats[] = []
  for (const strategy of ['scalping', 'swing', 'long_term']) {
    const entry = byStrategy.get(strategy)
    const strategyCount = predictions.filter((prediction) => prediction.strategy === strategy).length
    if (entry == null) {
      if (strategyCount > 0) {
        strategyStats.push({
          strategy,
          count: strategyCount,
          settledCount: 0,
          winRate: null,
          avgReturn: null,
          avgDrawdown: null
        })
      }
      continue
    }
    const decided = entry.wonLost.won + entry.wonLost.lost
    strategyStats.push({
      strategy,
      count: strategyCount,
      settledCount: entry.returns.length,
      winRate: decided > 0 ? round4(entry.wonLost.won / decided) : null,
      avgReturn: meanOrNull(entry.returns),
      avgDrawdown: meanOrNull(entry.drawdowns)
    })
  }

  const assetClassStats: AssetClassStats[] = []
  for (const assetClass of ['stock', 'forex', 'metal']) {
    const entry = byAssetClass.get(assetClass)
    const assetCount = predictions.filter((prediction) => prediction.assetClass === assetClass).length
    if (entry == null) {
      if (assetCount > 0) {
        assetClassStats.push({
          assetClass,
          count: assetCount,
          settledCount: 0,
          winRate: null,
          avgReturn: null,
          avgDrawdown: null
        })
      }
      continue
    }
    const decided = entry.wonLost.won + entry.wonLost.lost
    assetClassStats.push({
      assetClass,
      count: assetCount,
      settledCount: entry.returns.length,
      winRate: decided > 0 ? round4(entry.wonLost.won / decided) : null,
      avgReturn: meanOrNull(entry.returns),
      avgDrawdown: meanOrNull(entry.drawdowns)
    })
  }

  const calibration: CalibrationBucket[] = []
  for (const [bucketIndex, bucket] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const decided = bucket.won + bucket.lost
    calibration.push({
      bucket: `${bucketIndex * 10}-${bucketIndex * 10 + 9}`,
      count: decided,
      winRate: decided > 0 ? round4(bucket.won / decided) : null
    })
  }

  ctx.send.json({
    data: {
      counts,
      overall,
      byStrategy: strategyStats,
      byAssetClass: assetClassStats,
      calibration
    }
  })
}
