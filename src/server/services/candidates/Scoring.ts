/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Pure candidate scoring and filtering transforms, extracted verbatim from the
 * candidates route. Everything here is row -> row with no I/O, so ranking
 * behavior is locked by fixture tests.
 */

import Utils from '@app/server/Utils.ts'
import type * as Types from '@app/server/Types.ts'

function hasNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value)
}

const fundamentalPassDefaults = {
  perMin: 0,
  perMax: 25,
  roeMin: 8,
  derMax: 1.5,
  momentumMin: 5,
  minValue: 5_000_000_000,
  minVolume: 500_000
} as const

export function setupResult(row: Types.CandidateRow, setup: Types.TradingSetup) {
  if (setup === 'fundamental') {
    const reasons: string[] = []
    // Use computed advanced scores when available, otherwise fallback to base scores
    const fundRaw = row.fundamentalScore ??
      (row.qualityScore != null ? (row.qualityScore * 100) : 0)
    const valRaw = row.valuationScore ?? (row.valueScore != null ? (row.valueScore * 100) : 0)
    let momRaw = 0
    if (row.momentumScore != null) {
      // momentumScore can be 0..1 or 0..100 depending on earlier processing
      momRaw = row.momentumScore > 1 ? row.momentumScore : row.momentumScore * 100
    } else if (row.week13PC != null) {
      momRaw = row.week13PC
    }
    const liqRaw = row.liquidityScore ?? (() => {
      const v = row.avgValue20 ?? row.value ?? 0
      const vol = row.avgVolume20 ?? row.volume ?? 0
      if (v <= 0 && vol <= 0) {
        return 0
      }
      // crude normalization: treat thresholds (min->max) roughly
      const vScore = v >= 10_000_000_000 ? 100 : (v / 10_000_000_000) * 100
      const volScore = vol >= 1_000_000 ? 100 : (vol / 1_000_000) * 100
      return Math.round(((vScore + volScore) / 2) * 100) / 100
    })()
    // Composite recommendation score per requested weights
    const score = Math.round((0.4 * fundRaw + 0.3 * valRaw + 0.2 * momRaw + 0.1 * liqRaw) * 100) /
      100

    // Basic pass/fail criteria checks (these thresholds mirror the default filters).
    if (!hasNumber(row.per) || row.per < fundamentalPassDefaults.perMin) {
      reasons.push('PER >= 0')
    }
    if (!hasNumber(row.per) || row.per > fundamentalPassDefaults.perMax) {
      reasons.push('PER <= 25')
    }
    if (!hasNumber(row.roe) || row.roe < fundamentalPassDefaults.roeMin) {
      reasons.push('ROE >= 8%')
    }
    if (!hasNumber(row.der) || row.der > fundamentalPassDefaults.derMax) {
      reasons.push('DER <= 1.5')
    }
    const labelMomentum = row.selectedMomentumPC ?? row.week13PC ?? row.momentumScore ?? 0
    if (!hasNumber(row.relativeStrength) && !hasNumber(labelMomentum)) {
      reasons.push('Momentum available')
    }
    if (hasNumber(labelMomentum) && labelMomentum < fundamentalPassDefaults.momentumMin) {
      reasons.push('Momentum >= 5%')
    }
    // fallback to value/volume if avg fields missing
    if (!hasNumber(row.avgValue20) && !hasNumber(row.value)) {
      reasons.push('Avg value >= 5B')
    } else if ((row.avgValue20 ?? row.value ?? 0) < fundamentalPassDefaults.minValue) {
      reasons.push('Avg value >= 5B')
    }
    if (!hasNumber(row.avgVolume20) && !hasNumber(row.volume)) {
      reasons.push('Avg volume >= 500K')
    } else if ((row.avgVolume20 ?? row.volume ?? 0) < fundamentalPassDefaults.minVolume) {
      reasons.push('Avg volume >= 500K')
    }
    if (row.hasNotation) {
      reasons.push('Has notation')
    }
    if (row.hasUma) {
      reasons.push('Has UMA')
    }
    if (row.hasCorpAction) {
      reasons.push('Has corporate action')
    }

    // Labeling
    let label: string | null = null
    if ((row.roe ?? 0) > 18 && (row.der ?? 99) < 0.5 && labelMomentum > 15) {
      label = 'A+ Quality Compounder'
    } else if ((row.roe ?? 0) > 15 && (row.per ?? 999999) < 15 && labelMomentum > 10) {
      label = 'A Value Growth'
    } else if ((row.roe ?? 0) >= fundamentalPassDefaults.roeMin) {
      label = 'B Watchlist'
    } else {
      label = 'C Avoid'
    }

    const pass = reasons.length === 0
    return { pass, score, label, reasons }
  }
  const conditions = setup === 'rebound'
    ? [
      { pass: hasNumber(row.volume) && row.volume >= 1_000_000, reason: 'Vol > 1M' },
      { pass: hasNumber(row.relVolume) && row.relVolume > 1.2, reason: 'Rel vol > 1.2' },
      {
        pass: hasNumber(row.rsi14) && row.rsi14 >= 25 && row.rsi14 <= 60,
        reason: 'RSI 25-60'
      },
      {
        pass: hasNumber(row.price) && hasNumber(row.ema10) && row.price > row.ema10,
        reason: 'Price > EMA10'
      },
      {
        pass: hasNumber(row.price) && hasNumber(row.ema200) && row.price < row.ema200,
        reason: 'Price < EMA200'
      },
      { pass: hasNumber(row.changePct) && row.changePct > 0, reason: 'Chg > 0%' }
    ]
    : [
      {
        pass: hasNumber(row.marketCapital) &&
          row.marketCapital >= 100_000_000_000 &&
          row.marketCapital <= 20_000_000_000_000,
        reason: 'MCap 100B-20T'
      },
      {
        pass: hasNumber(row.bbBasis20) && hasNumber(row.price) && row.bbBasis20 < row.price,
        reason: 'Price > BB basis'
      },
      { pass: hasNumber(row.volume) && row.volume > 5_000_000, reason: 'Vol > 5M' },
      {
        pass: hasNumber(row.plusDi14) && hasNumber(row.minusDi14) && row.plusDi14 > row.minusDi14,
        reason: 'DMI+ > DMI-'
      },
      { pass: hasNumber(row.momentum10) && row.momentum10 > 0, reason: 'Mom10 > 0' },
      { pass: hasNumber(row.relVolume) && row.relVolume > 0.5, reason: 'Rel vol > 0.5' },
      {
        pass: hasNumber(row.ema20) && hasNumber(row.ema50) && row.ema20 > row.ema50,
        reason: 'EMA20 > EMA50'
      },
      { pass: hasNumber(row.adx14) && row.adx14 > 18, reason: 'ADX > 18' }
    ]
  const passed = conditions.filter((condition) => condition.pass)
  const score = Math.round((passed.length / conditions.length) * 100)
  return {
    pass: setup === 'rebound' ? passed.length === conditions.length : score >= 75,
    score,
    label: setup === 'rebound' ? 'Rebound Day' : 'Swing Trade',
    reasons: passed.map((condition) => condition.reason)
  }
}

export type MergeContext = {
  codeToFlags: Map<string, Types.CodeFlags>
  codeToLiquidity: Map<string, Types.LiquiditySnapshot>
  codeToFundamentals: Map<string, Types.FundamentalsValues>
  codeToMarketCapital: Map<string, number | null>
  codeToChangePct: Map<string, number | null>
  codeToTechnical: Map<string, Types.TechnicalMetrics>
}

export function mergeScreenerAndTechnical(
  rankedRows: Types.RankedRow[],
  context: MergeContext
): Types.CandidateRow[] {
  return rankedRows.map((row) => {
    const flags = context.codeToFlags.get(row.code)
    const hasNotation = Utils.isNonEmptyString(flags?.notation)
    const hasCorpAction = Utils.isNonEmptyString(flags?.corpAction)
    const hasUma = Utils.isNonEmptyString(flags?.umaDate)
    const liquidity = context.codeToLiquidity.get(row.code)
    const transactionValue = liquidity?.value ?? null
    const volume = liquidity?.volume ?? null
    const fundamentals = context.codeToFundamentals.get(row.code)
    const changePct = context.codeToChangePct.get(row.code) ?? null
    const technical = context.codeToTechnical.get(row.code)
    return {
      ...row,
      hasNotation,
      hasCorpAction,
      hasUma,
      marketCapital: context.codeToMarketCapital.get(row.code) ?? null,
      per: fundamentals?.per ?? null,
      pbv: fundamentals?.pbv ?? null,
      roa: fundamentals?.roa ?? null,
      roe: fundamentals?.roe ?? null,
      der: fundamentals?.der ?? null,
      week1PC: fundamentals?.week1PC ?? null,
      week4PC: fundamentals?.week4PC ?? null,
      week13PC: fundamentals?.week13PC ?? null,
      week26PC: fundamentals?.week26PC ?? null,
      week52PC: fundamentals?.week52PC ?? null,
      npm: fundamentals?.npm ?? null,
      value: transactionValue,
      volume,
      changePct,
      price: technical?.price ?? null,
      rsi14: technical?.rsi14 ?? null,
      relVolume: technical?.relVolume ?? null,
      ema10: technical?.ema10 ?? null,
      ema20: technical?.ema20 ?? null,
      ema50: technical?.ema50 ?? null,
      ema200: technical?.ema200 ?? null,
      bbBasis20: technical?.bbBasis20 ?? null,
      momentum10: technical?.momentum10 ?? null,
      adx14: technical?.adx14 ?? null,
      plusDi14: technical?.plusDi14 ?? null,
      minusDi14: technical?.minusDi14 ?? null,
      recommendationScore: 0,
      recommendationLabel: null,
      recommendationReasons: [],
      compositePercentile: 0
    }
  })
}

export type EnhanceContext = {
  codeToAvgVolume20: Map<string, number | null>
  codeToAvgValue20: Map<string, number | null>
  rankedRows: Types.RankedRow[]
  rowsForScore: Types.ScreenerRow[]
  momentumWeek: 1 | 4 | 13 | 26
}

export function enhanceCandidates(
  candidates: Types.CandidateRow[],
  context: EnhanceContext
): Types.CandidateRow[] {
  // Attach advanced scores, liquidity normalization, relative strength and trend flags
  const avgVolList: number[] = []
  const avgValList: number[] = []
  for (const r of candidates) {
    const av = context.codeToAvgVolume20.get(r.code) ?? null
    const avv = context.codeToAvgValue20.get(r.code) ?? null
    if (av != null && Number.isFinite(av)) {
      avgVolList.push(av)
    }
    if (avv != null && Number.isFinite(avv)) {
      avgValList.push(avv)
    }
  }
  const minMax = (arr: number[]) => {
    if (arr.length === 0) {
      return { min: 0, max: 0 }
    }
    return { min: Math.min(...arr), max: Math.max(...arr) }
  }
  const volRange = minMax(avgVolList)
  const valRange = minMax(avgValList)
  const periodReturns = context.rowsForScore.map((r) => {
    const week = context.momentumWeek
    return week === 1
      ? (r.week1PC ?? 0)
      : week === 4
      ? (r.week4PC ?? 0)
      : week === 13
      ? (r.week13PC ?? 0)
      : (r.week26PC ?? 0)
  })
  const indexReturnAvg = periodReturns.length > 0
    ? periodReturns.reduce((s, x) => s + x, 0) / periodReturns.length
    : 0
  const codeToRanked = new Map(context.rankedRows.map((r) => [r.code, r]))
  const enhancedCandidates: Types.CandidateRow[] = []
  for (const row of candidates) {
    const avgVol = context.codeToAvgVolume20.get(row.code) ?? null
    const avgVal = context.codeToAvgValue20.get(row.code) ?? null
    const ranked = codeToRanked.get(row.code)
    const fundamentalScore = ranked ? (ranked.qualityScore ?? 0) * 100 : 0
    const valuationScore = ranked ? (ranked.valueScore ?? 0) * 100 : 0
    const momentumScore = ranked ? (ranked.momentumScore ?? 0) * 100 : 0
    // liquidity normalization
    const normVol = avgVol != null && volRange.max > volRange.min
      ? (avgVol - volRange.min) / (volRange.max - volRange.min)
      : avgVol != null
      ? 0.5
      : 0
    const normVal = avgVal != null && valRange.max > valRange.min
      ? (avgVal - valRange.min) / (valRange.max - valRange.min)
      : avgVal != null
      ? 0.5
      : 0
    const liquidityScore = Math.round(((normVol + normVal) / 2) * 10000) / 100
    const totalScore = Math.round(
      (0.4 * fundamentalScore + 0.3 * valuationScore + 0.2 * momentumScore +
        0.1 * liquidityScore) * 100
    ) / 100
    // relative strength (proxy): stock return - market average return
    const stockReturn = context.momentumWeek === 1
      ? (row.week1PC ?? 0)
      : context.momentumWeek === 4
      ? (row.week4PC ?? 0)
      : context.momentumWeek === 13
      ? (row.week13PC ?? 0)
      : (row.week26PC ?? 0)
    const relativeStrength = stockReturn - (indexReturnAvg ?? 0)
    // trend checks
    const bullishTrend = row.price != null && row.ema20 != null && row.ema50 != null &&
      row.ema200 != null && row.price > row.ema20 && row.ema20 > row.ema50 &&
      row.ema50 > row.ema200
    const earlyReversal = row.price != null && row.ema20 != null && row.rsi14 != null &&
      avgVol != null && row.price > row.ema20 && row.rsi14 > 50 && (row.volume ?? 0) > avgVol
    const smartMoney = avgVol != null && row.volume != null && row.relVolume != null &&
      row.volume > (avgVol * 1.2) && row.relVolume > 1.5 && row.price != null &&
      row.ema20 != null && row.price > row.ema20
    enhancedCandidates.push({
      ...row,
      fundamentalScore,
      valuationScore,
      momentumScore,
      liquidityScore,
      totalScore,
      avgVolume20: avgVol,
      avgValue20: avgVal,
      relativeStrength,
      selectedMomentumPC: stockReturn,
      bullishTrend,
      earlyReversal,
      smartMoney
    })
  }
  return enhancedCandidates
}

export type SignalFilters = {
  relativeStrengthMin: number | undefined
  smartMoneyOnly: boolean
  requireBullishTrend: boolean
  requireEarlyReversal: boolean
}

export function applySignalFilters(
  candidates: Types.CandidateRow[],
  filters: SignalFilters
): Types.CandidateRow[] {
  let filtered = candidates
  if (filters.relativeStrengthMin != null) {
    filtered = filtered.filter((r) =>
      (r.relativeStrength ?? 0) >= filters.relativeStrengthMin!
    )
  }
  if (filters.smartMoneyOnly) {
    filtered = filtered.filter((r) => r.smartMoney === true)
  }
  if (filters.requireBullishTrend) {
    filtered = filtered.filter((r) => r.bullishTrend === true)
  }
  if (filters.requireEarlyReversal) {
    filtered = filtered.filter((r) => r.earlyReversal === true)
  }
  return filtered
}

export function applySectorRanks(
  candidates: Types.CandidateRow[]
): Types.CandidateRowWithSectorRank[] {
  const bySector = new Map<string, Types.CandidateRow[]>()
  for (const row of candidates) {
    Utils.pushToMapList(bySector, row.sector ?? '', row)
  }
  const candidatesWithSectorRank: Types.CandidateRowWithSectorRank[] = []
  for (const sectorRows of bySector.values()) {
    sectorRows.sort((a, b) => b.compositeScore - a.compositeScore)
    const sectorCount = sectorRows.length
    sectorRows.forEach((candidateRow, index) => {
      const sectorRank = index + 1
      const sectorPercentile = Utils.sectorPercentile(sectorRank, sectorCount)
      candidatesWithSectorRank.push({
        ...candidateRow,
        sectorRank,
        sectorPercentile
      })
    })
  }
  candidatesWithSectorRank.sort((a, b) => b.compositeScore - a.compositeScore)
  return candidatesWithSectorRank
}

export type ExclusionFilters = {
  excludeNotation: boolean
  excludeCorpAction: boolean
  excludeUma: boolean
  minValue: number | undefined
  minVolume: number | undefined
  setup: Types.TradingSetup
}

export function applyExclusionFilters(
  candidates: Types.CandidateRow[] | Types.CandidateRowWithSectorRank[],
  filters: ExclusionFilters
): (Types.CandidateRow | Types.CandidateRowWithSectorRank)[] {
  let filtered = candidates
  if (filters.excludeNotation) {
    filtered = filtered.filter((row) => !row.hasNotation)
  }
  if (filters.excludeCorpAction) {
    filtered = filtered.filter((row) => !row.hasCorpAction)
  }
  if (filters.excludeUma) {
    filtered = filtered.filter((row) => !row.hasUma)
  }
  if (filters.minValue != null) {
    filtered = filtered.filter((row) =>
      (filters.setup === 'fundamental' ? row.avgValue20 ?? row.value ?? 0 : row.value ?? 0) >=
        filters.minValue!
    )
  }
  if (filters.minVolume != null) {
    filtered = filtered.filter((row) =>
      (filters.setup === 'fundamental' ? row.avgVolume20 ?? row.volume ?? 0 : row.volume ?? 0) >=
        filters.minVolume!
    )
  }
  return filtered
}

export function applySetupMapping(
  candidates: (Types.CandidateRow | Types.CandidateRowWithSectorRank)[],
  setup: Types.TradingSetup,
  includeRejected: boolean
): (Types.CandidateRow | Types.CandidateRowWithSectorRank)[] {
  return candidates
    .map((row) => {
      const result = setupResult(row, setup)
      return {
        ...row,
        recommendationScore: result.score,
        recommendationLabel: result.label,
        recommendationReasons: result.reasons
      }
    })
    .filter((row) => includeRejected || setupResult(row, setup).pass)
}

export function sortCandidates(
  candidates: (Types.CandidateRow | Types.CandidateRowWithSectorRank)[],
  setup: Types.TradingSetup
): (Types.CandidateRow | Types.CandidateRowWithSectorRank)[] {
  const sorted = [...candidates]
  if (setup === 'fundamental') {
    sorted.sort((a, b) =>
      (b.recommendationScore - a.recommendationScore) ||
      ((b.roe ?? 0) - (a.roe ?? 0)) ||
      ((b.momentumScore ?? 0) - (a.momentumScore ?? 0)) ||
      // cheaper PER first
      ((a.per ?? Number.MAX_VALUE) - (b.per ?? Number.MAX_VALUE)) ||
      ((b.liquidityScore ?? 0) - (a.liquidityScore ?? 0))
    )
  } else {
    sorted.sort(
      (a, b) =>
        (b.recommendationScore - a.recommendationScore) || (b.compositeScore - a.compositeScore)
    )
  }
  return sorted
}

export function applySectorAndSearchFilters(
  candidates: (Types.CandidateRow | Types.CandidateRowWithSectorRank)[],
  sector: string | undefined,
  search: string | undefined
): (Types.CandidateRow | Types.CandidateRowWithSectorRank)[] {
  let filtered = candidates
  if (sector !== undefined) {
    filtered = filtered.filter(
      (row) => row.sector != null && row.sector.trim() === sector
    )
  }
  if (search !== undefined) {
    filtered = filtered.filter((row) => {
      const code = row.code?.toLowerCase() ?? ''
      const name = row.name?.toLowerCase() ?? ''
      const sectorLower = row.sector?.toLowerCase() ?? ''
      return (
        code.includes(search) || name.includes(search) || sectorLower.includes(search)
      )
    })
  }
  return filtered
}

export function finalRankingSort(
  candidates: (Types.CandidateRow | Types.CandidateRowWithSectorRank)[]
): (Types.CandidateRow | Types.CandidateRowWithSectorRank)[] {
  const sorted = [...candidates]
  // Final ranking: Score, ROE, Momentum, cheapest PER, Liquidity.
  sorted.sort((a, b) =>
    (b.recommendationScore ?? b.totalScore ?? 0) - (a.recommendationScore ?? a.totalScore ?? 0) ||
    ((b.roe ?? 0) - (a.roe ?? 0)) ||
    ((b.momentumScore ?? 0) - (a.momentumScore ?? 0)) ||
    ((a.per ?? Number.MAX_VALUE) - (b.per ?? Number.MAX_VALUE)) ||
    ((b.liquidityScore ?? 0) - (a.liquidityScore ?? 0))
  )
  return sorted
}
