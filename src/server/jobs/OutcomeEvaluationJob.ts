/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Settles open predictions whose horizon window has fully elapsed. Runs from
 * the hourly ingestion cron and lazily from the predictions API; a module-level
 * in-flight guard prevents concurrent double evaluation.
 */

import { and, asc, eq, gte, lt, lte } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { CronDate } from '@app/server/services/Date.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'
import {
  evaluatePrediction,
  type EvaluationBar
} from '@app/server/services/prediction/outcomeEvaluation.ts'

const SETTLE_MIN_AGE_MS = 24 * 60 * 60 * 1000

let inFlight: Promise<number> | null = null

async function stockBarsBetween(
  symbol: string,
  fromDateInt: number,
  toDateInt: number
): Promise<EvaluationBar[]> {
  const rows = await Database.select({
    date: Schemas.summary.date,
    priceHigh: Schemas.summary.priceHigh,
    priceLow: Schemas.summary.priceLow,
    priceClose: Schemas.summary.priceClose
  })
    .from(Schemas.summary)
    .where(
      and(
        eq(Schemas.summary.stockCode, symbol),
        gte(Schemas.summary.date, fromDateInt),
        lte(Schemas.summary.date, toDateInt)
      )
    )
    .orderBy(asc(Schemas.summary.date))
  return rows.map((row) => ({
    dateInt: row.date,
    high: row.priceHigh,
    low: row.priceLow,
    close: row.priceClose
  }))
}

async function settleOne(prediction: typeof Schemas.predictions.$inferSelect): Promise<boolean> {
  const createdDateInt = CronDate.jakartaDateIntFromDate(new Date(prediction.createdAt))
  const windowEnd = createdDateInt + prediction.horizonDays
  const bars =
    prediction.assetClass === 'stock'
      ? await stockBarsBetween(prediction.symbol, createdDateInt, windowEnd)
      : await InstrumentService.barsBetween(prediction.symbol, createdDateInt, windowEnd)

  const result = evaluatePrediction(
    {
      createdDateInt,
      horizonDays: prediction.horizonDays,
      entryPrice: prediction.entryPrice,
      targetPrice: prediction.targetPrice,
      stopLoss: prediction.stopLoss,
      bars
    },
    CronDate.todayDateInt()
  )
  if (result.status === 'open') {
    return false
  }

  await Database.transaction(async (tx) => {
    await tx.insert(Schemas.predictionOutcomes).values({
      predictionId: prediction.id,
      referencePrice: result.referencePrice ?? 0,
      returnPercent: result.returnPercent ?? 0,
      maxFavorableExcursion: result.maxFavorableExcursion,
      maxAdverseExcursion: result.maxAdverseExcursion,
      hitTarget: result.hitTarget,
      hitStop: result.hitStop
    })
    await tx
      .update(Schemas.predictions)
      .set({ status: result.status })
      .where(eq(Schemas.predictions.id, prediction.id))
  })
  return true
}

export class OutcomeEvaluationJob {
  /** Settles open predictions older than a day, up to `limit`. Returns the settled count. */
  static run(limit = 200): Promise<number> {
    if (inFlight != null) {
      return inFlight
    }
    inFlight = OutcomeEvaluationJob.runInternal(limit).finally(() => {
      inFlight = null
    })
    return inFlight
  }

  private static async runInternal(limit: number): Promise<number> {
    const threshold = new Date(Date.now() - SETTLE_MIN_AGE_MS)
    const candidates = await Database.select()
      .from(Schemas.predictions)
      .where(and(eq(Schemas.predictions.status, 'open'), lt(Schemas.predictions.createdAt, threshold)))
      .orderBy(asc(Schemas.predictions.createdAt))
      .limit(Math.min(Math.max(limit, 1), 500))

    let settled = 0
    for (const prediction of candidates) {
      try {
        if (await settleOne(prediction)) {
          settled++
        }
      } catch (error) {
        console.error(`[evaluation] failed to settle ${prediction.symbol}:`, error)
      }
    }
    if (settled > 0) {
      console.info(`[evaluation] settled ${settled} prediction(s)`)
    }
    return settled
  }
}
