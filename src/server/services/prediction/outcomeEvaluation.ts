/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Pure prediction outcome evaluation. A prediction settles once its horizon
 * window has fully elapsed:
 *  - `won`     — a bar's high reached the target before any bar's low hit the stop
 *  - `lost`    — a bar's low hit the stop first (risk-first: same-bar both-hit is a loss)
 *  - `expired` — window elapsed without either level being touched
 *  - `open`    — window has not fully elapsed yet
 */

import { round2 } from '@app/server/services/prediction/numbers.ts'

export type PredictionStatus = 'open' | 'won' | 'lost' | 'expired'

export type EvaluationBar = {
  dateInt: number
  high: number | null
  low: number | null
  close: number | null
}

export type EvaluationInput = {
  /** Calendar date (yyyymmdd int) the prediction was created — day 0. */
  createdDateInt: number
  horizonDays: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  /** Trading-day bars, any order — the evaluator sorts them ascending. */
  bars: EvaluationBar[]
}

export type EvaluationResult = {
  status: PredictionStatus
  referencePrice: number | null
  returnPercent: number | null
  maxFavorableExcursion: number | null
  maxAdverseExcursion: number | null
  hitTarget: 'yes' | 'no'
  hitStop: 'yes' | 'no'
}

function finite(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) ? value : null
}

/**
 * Evaluates a prediction against bars with dateInt within [day0, day0 + horizon].
 * Pure — `todayDateInt` is passed in so the same fixtures settle identically.
 */
export function evaluatePrediction(input: EvaluationInput, todayDateInt: number): EvaluationResult {
  const windowEnd = input.createdDateInt + input.horizonDays
  const windowBars = input.bars
    .filter((bar) => bar.dateInt >= input.createdDateInt && bar.dateInt <= windowEnd)
    .sort((first, second) => first.dateInt - second.dateInt)

  let hitTarget = false
  let hitStop = false
  let mfe: number | null = null
  let mae: number | null = null

  for (const bar of windowBars) {
    const high = finite(bar.high)
    const low = finite(bar.low)
    if (high != null) {
      if (high >= input.targetPrice) {
        hitTarget = true
      }
      const excursion = ((high - input.entryPrice) / input.entryPrice) * 100
      mfe = mfe == null ? excursion : Math.max(mfe, excursion)
    }
    if (low != null) {
      if (low <= input.stopLoss) {
        hitStop = true
      }
      const excursion = ((low - input.entryPrice) / input.entryPrice) * 100
      mae = mae == null ? excursion : Math.min(mae, excursion)
    }
  }

  const base = {
    maxFavorableExcursion: mfe != null ? round2(mfe) : null,
    maxAdverseExcursion: mae != null ? round2(mae) : null,
    hitTarget: hitTarget ? ('yes' as const) : ('no' as const),
    hitStop: hitStop ? ('yes' as const) : ('no' as const)
  }

  // Window has not fully elapsed: still open.
  if (todayDateInt <= windowEnd) {
    return { status: 'open', referencePrice: null, returnPercent: null, ...base }
  }

  // First-trigger scan, risk-first: within a bar the stop is checked before
  // the target, so a same-bar both-hit resolves as a loss.
  let firstTrigger: 'won' | 'lost' | null = null
  for (const bar of windowBars) {
    const low = finite(bar.low)
    const high = finite(bar.high)
    if (low != null && low <= input.stopLoss) {
      firstTrigger = 'lost'
      break
    }
    if (high != null && high >= input.targetPrice) {
      firstTrigger = 'won'
      break
    }
  }

  if (firstTrigger === 'won') {
    const returnPercent = ((input.targetPrice - input.entryPrice) / input.entryPrice) * 100
    return {
      status: 'won',
      referencePrice: input.targetPrice,
      returnPercent: round2(returnPercent),
      ...base
    }
  }
  if (firstTrigger === 'lost') {
    const returnPercent = ((input.stopLoss - input.entryPrice) / input.entryPrice) * 100
    return {
      status: 'lost',
      referencePrice: input.stopLoss,
      returnPercent: round2(returnPercent),
      ...base
    }
  }

  // Expired: reference the last close inside the window; fall back to the
  // latest bar available, then null when there are no bars at all.
  const lastWindowClose = [...windowBars]
    .reverse()
    .map((bar) => finite(bar.close))
    .find((close) => close != null)
  const lastAnyClose = [...input.bars]
    .sort((first, second) => first.dateInt - second.dateInt)
    .reverse()
    .map((bar) => finite(bar.close))
    .find((close) => close != null)
  const referencePrice = lastWindowClose ?? lastAnyClose ?? null
  return {
    status: 'expired',
    referencePrice,
    returnPercent:
      referencePrice != null
        ? round2(((referencePrice - input.entryPrice) / input.entryPrice) * 100)
        : null,
    ...base
  }
}
