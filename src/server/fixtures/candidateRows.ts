/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Candidate row fixtures for the setupResult scoring tests. Boundary values
 * are chosen to pin the exact pass/fail thresholds of the extracted scoring
 * logic (PER 3.0 and DER 0.8 are inclusive, swing passes at exactly 75%).
 */

import type * as Types from '@app/server/Types.ts'

export function makeCandidateRow(
  overrides: Partial<Types.CandidateRow> = {}
): Types.CandidateRow {
  return {
    code: 'FIXT',
    name: 'Fixture Corp Tbk',
    sector: 'Fixture Sector',
    valueScore: 0.6,
    qualityScore: 0.7,
    momentumScore: 0.5,
    compositeScore: 65,
    rank: 1,
    hasNotation: false,
    hasCorpAction: false,
    hasUma: false,
    per: 12,
    roe: 18,
    der: 0.6,
    week26PC: 10,
    week52PC: 15,
    marketCapital: 500_000_000_000,
    pbv: 2,
    roa: 8,
    week1PC: 1,
    week4PC: 4,
    week13PC: 12,
    npm: 10,
    value: 20_000_000_000,
    volume: 3_000_000,
    changePct: 1.5,
    price: 1000,
    rsi14: 50,
    relVolume: 1,
    ema10: 990,
    ema20: 980,
    ema50: 950,
    ema200: 900,
    bbBasis20: 980,
    momentum10: 2,
    adx14: 20,
    plusDi14: 25,
    minusDi14: 15,
    recommendationScore: 0,
    recommendationLabel: null,
    recommendationReasons: [],
    compositePercentile: 0,
    fundamentalScore: 80,
    valuationScore: 60,
    liquidityScore: 70,
    totalScore: 68,
    avgVolume20: 5_000_000,
    avgValue20: 50_000_000_000,
    relativeStrength: 5,
    selectedMomentumPC: 18,
    bullishTrend: false,
    earlyReversal: false,
    smartMoney: false,
    ...overrides
  }
}

/** Meets every fundamental gate and earns the top label. */
export const fundamentalPassRow = makeCandidateRow({ roe: 20, der: 0.4 })

/** Exactly on the fundamental boundaries: PER 3.0 and DER 0.8 are inclusive. */
export const fundamentalBorderlineRow = makeCandidateRow({
  code: 'EDGE',
  per: 3.0,
  roe: 15,
  der: 0.8,
  selectedMomentumPC: 10,
  avgValue20: 10_000_000_000,
  avgVolume20: 1_000_000
})

/** Fails every fundamental gate and carries exclusion flags. */
export const fundamentalFailRow = makeCandidateRow({
  code: 'FAIL',
  per: 25,
  roe: 5,
  der: 3,
  selectedMomentumPC: 2,
  relativeStrength: null,
  avgValue20: 1_000_000_000,
  avgVolume20: 100_000,
  hasNotation: true,
  hasUma: true,
  hasCorpAction: true
})

/** Swing row passing exactly 6 of 8 conditions: 75% is a pass. */
export const swingBorderlineRow = makeCandidateRow({
  code: 'SWNG',
  marketCapital: 1_000_000_000_000,
  price: 1000,
  bbBasis20: 990,
  volume: 6_000_000,
  plusDi14: 30,
  minusDi14: 20,
  momentum10: 1,
  relVolume: 0.6,
  ema20: 950,
  ema50: 980, // fails EMA20 > EMA50
  adx14: 10 // fails ADX > 18
})

/** Rebound row passing all six conditions. */
export const reboundPassRow = makeCandidateRow({
  code: 'RBN',
  volume: 2_000_000,
  relVolume: 1.5,
  rsi14: 45,
  price: 1000,
  ema10: 980,
  ema200: 1100,
  changePct: 2
})

/** Rebound row failing one condition (price below EMA10). */
export const reboundFailRow = makeCandidateRow({
  code: 'RBNDN',
  price: 970,
  ema10: 980
})
