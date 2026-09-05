/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Pure indicator helpers for the prediction rules engine. Every function takes
 * plain arrays and returns null when there is not enough data, so they can be
 * fixture-tested without a database.
 */

import RSI from '@app/server/RSI.ts'

export function average(values: number[]): number | null {
  const finiteValues = values.filter((value) => Number.isFinite(value))
  if (finiteValues.length === 0) {
    return null
  }
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
}

export function sma(values: number[], period: number): number | null {
  if (values.length < period || period < 1) {
    return null
  }
  return average(values.slice(-period))
}

/**
 * Exponential moving average with an SMA seed, matching the convention used by
 * `Services.Technical` for the screener.
 */
export function ema(values: number[], period: number): number | null {
  if (values.length < period || period < 1) {
    return null
  }
  const multiplier = 2 / (period + 1)
  const seed = average(values.slice(0, period))
  if (seed == null) {
    return null
  }
  let current = seed
  for (const value of values.slice(period)) {
    current = (value - current) * multiplier + current
  }
  return current
}

/** Latest RSI-14 over a close series, null-padded like `RSI.calculate`. */
export function rsi14(closes: number[]): number | null {
  const values = RSI.calculate(closes, RSI.defaultPeriod)
  return values[values.length - 1] ?? null
}

/**
 * True range at index `i`. Requires close[i-1]; the first bar has no true range.
 */
export function trueRangeAt(
  highs: (number | null)[],
  lows: (number | null)[],
  closes: number[],
  index: number
): number | null {
  if (index < 1 || index >= closes.length) {
    return null
  }
  const high = highs[index]
  const low = lows[index]
  const closePrev = closes[index - 1]
  if (
    high == null ||
    low == null ||
    closePrev == null ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(closePrev)
  ) {
    return null
  }
  return Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev))
}

/**
 * Latest ATR-14 with Wilder smoothing over high/low/close series.
 */
export function atr14(
  highs: (number | null)[],
  lows: (number | null)[],
  closes: number[],
  period = 14
): number | null {
  const length = Math.min(highs.length, lows.length, closes.length)
  if (length < period + 1) {
    return null
  }
  const trValues: number[] = []
  for (let index = 1; index < length; index++) {
    const tr = trueRangeAt(highs, lows, closes, index)
    if (tr == null) {
      continue
    }
    trValues.push(tr)
  }
  if (trValues.length < period) {
    return null
  }
  let atr = trValues.slice(0, period).reduce((sum, value) => sum + value, 0) / period
  for (const value of trValues.slice(period)) {
    atr = (atr * (period - 1) + value) / period
  }
  return atr
}

/**
 * Annualized realized volatility (%) from the last 20 daily log returns.
 * Uses sample standard deviation (n - 1) of log returns scaled by sqrt(252).
 */
export function realizedVol20(closes: number[]): number | null {
  const window = closes.slice(-21)
  const returns: number[] = []
  for (let index = 1; index < window.length; index++) {
    const previous = window[index - 1]
    const current = window[index]
    if (
      previous == null ||
      current == null ||
      !Number.isFinite(previous) ||
      !Number.isFinite(current) ||
      previous <= 0 ||
      current <= 0
    ) {
      continue
    }
    returns.push(Math.log(current / previous))
  }
  if (returns.length < 2) {
    return null
  }
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(252) * 100
}

/** Percentage change over the last `bars` closes, null when unavailable. */
export function returnOverBars(closes: number[], bars: number): number | null {
  if (closes.length < bars + 1 || bars < 1) {
    return null
  }
  const start = closes[closes.length - 1 - bars]
  const end = closes[closes.length - 1]
  if (start == null || end == null || !Number.isFinite(start) || !Number.isFinite(end) || start <= 0) {
    return null
  }
  return ((end - start) / start) * 100
}
