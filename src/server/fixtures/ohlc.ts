/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Hand-computed fixture series for indicator and evaluation tests. Expected
 * values are derived by hand in the test files so regressions are caught
 * against independent math, not against the implementation itself.
 */

/** 15 ascending closes (1..15): every RSI-14 change is a gain. */
export const closesAllUp: number[] = Array.from({ length: 15 }, (_, index) => index + 1)

/** 15 descending closes (15..1): every RSI-14 change is a loss. */
export const closesAllDown: number[] = Array.from({ length: 15 }, (_, index) => 15 - index)

/**
 * 15 closes where RSI-14 is exactly 60: nine gains of 1/3 (+3.0 total) and
 * five losses of 0.4 (−2.0 total) give RS = 3/2 → RSI = 100 − 100/2.5 = 60.
 */
export const closesRsi60: number[] = (() => {
  const closes = [100]
  const changes = [1 / 3, -0.4, 1 / 3, -0.4, 1 / 3, 1 / 3, -0.4, 1 / 3, -0.4, 1 / 3, 1 / 3, -0.4, 1 / 3, 1 / 3]
  for (const change of changes) {
    closes.push(closes[closes.length - 1]! + change)
  }
  return closes
})()

/** ATR period-2 series where every true range is exactly 2. */
export const atrPeriod2 = {
  highs: [10, 11, 12],
  lows: [8, 9, 10],
  closes: [9, 10, 11]
}

/** Constant 10% log-return series: realized volatility must be 0. */
export const closesConstantReturn: number[] = [100, 110, 121, 133.1]

/** 15 alternating closes for the flat-average RSI case (RSI = 50). */
export const closesAlternating: number[] = (() => {
  const closes = [100]
  for (let index = 0; index < 14; index++) {
    closes.push(closes[closes.length - 1]! + (index % 2 === 0 ? 1 : -1))
  }
  return closes
})()
