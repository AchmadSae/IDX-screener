/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import Utils from '@app/server/Utils.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import * as Services from '@app/server/services/index.ts'
import type * as Types from '@app/server/Types.ts'

function getTradingSetup(raw: string | undefined): Types.TradingSetup {
  return raw === 'rebound' || raw === 'swing' ? raw : 'fundamental'
}

function hasNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value)
}

function computeReturnForWeek(
  rows: { date: number; priceClose: number | null }[],
  endDate: number,
  week: 1 | 4 | 13 | 26
): number | null {
  const startDate = Utils.addDaysToDateInt(endDate, -week * 7)
  const periodRows = rows
    .filter((row) => row.date >= startDate && row.date <= endDate && row.priceClose != null)
    .sort((a, b) => a.date - b.date)
  const firstClose = periodRows[0]?.priceClose
  const lastClose = periodRows[periodRows.length - 1]?.priceClose
  if (firstClose == null || lastClose == null) {
    return null
  }
  return Utils.returnPctFromPrices(firstClose, lastClose)
}

function setupResult(row: Types.CandidateRow, setup: Types.TradingSetup) {
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

    // Basic pass/fail criteria checks (these thresholds are defaults; params may override)
    if (!hasNumber(row.per) || row.per < 3) {
      reasons.push('PER >= 3')
    }
    if (!hasNumber(row.per) || row.per > 18) {
      reasons.push('PER <= 18')
    }
    if (!hasNumber(row.roe) || row.roe < 15) {
      reasons.push('ROE >= 15%')
    }
    if (!hasNumber(row.der) || row.der > 0.8) {
      reasons.push('DER <= 0.8')
    }
    const labelMomentum = row.selectedMomentumPC ?? row.week13PC ?? row.momentumScore ?? 0
    if (!hasNumber(row.relativeStrength) && !hasNumber(labelMomentum)) {
      reasons.push('Momentum available')
    }
    if (hasNumber(labelMomentum) && labelMomentum < 10) {
      reasons.push('Momentum >= 10%')
    }
    // fallback to value/volume if avg fields missing
    if (!hasNumber(row.avgValue20) && !hasNumber(row.value)) {
      reasons.push('Avg value >= 10B')
    } else if ((row.avgValue20 ?? row.value ?? 0) < 10_000_000_000) {
      reasons.push('Avg value >= 10B')
    }
    if (!hasNumber(row.avgVolume20) && !hasNumber(row.volume)) {
      reasons.push('Avg volume >= 1M')
    } else if ((row.avgVolume20 ?? row.volume ?? 0) < 1_000_000) {
      reasons.push('Avg volume >= 1M')
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
    } else if ((row.roe ?? 0) > 12) {
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

export async function GET(ctx: Context) {
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query('date')))
  const dateInt = dateParsed ?? Services.CronDate.todayDateInt()
  try {
    const setup = getTradingSetup(Utils.queryString(ctx.query('setup')))
    const minValueRaw = ctx.query('minValue')
    const minVolumeRaw = ctx.query('minVolume')
    const excludeNotationRaw = ctx.query('excludeNotation')
    const excludeCorpActionRaw = ctx.query('excludeCorpAction')
    const excludeUmaRaw = ctx.query('excludeUma')
    let minValue = Utils.parseNumber(Utils.queryString(minValueRaw))
    let minVolume = Utils.parseNumber(Utils.queryString(minVolumeRaw))
    let excludeNotation = Utils.parseBoolean(Utils.queryString(excludeNotationRaw))
    let excludeCorpAction = Utils.parseBoolean(Utils.queryString(excludeCorpActionRaw))
    let excludeUma = Utils.parseBoolean(Utils.queryString(excludeUmaRaw))
    const perMinRaw = ctx.query('perMin')
    const perMaxRaw = ctx.query('perMax')
    const roeMinRaw = ctx.query('roeMin')
    const derMaxRaw = ctx.query('derMax')
    const pbvMaxRaw = ctx.query('pbvMax')
    const minMarketCapitalRaw = ctx.query('minMarketCapital')
    const netMarginMinRaw = ctx.query('netMarginMin')
    const momentumWeekRaw = ctx.query('momentumWeek')
    const momentumMinRaw = ctx.query('momentumMin')
    const relativeStrengthRaw = ctx.query('relativeStrengthMin')
    const smartMoneyOnlyRaw = ctx.query('smartMoneyOnly')
    const requireBullishTrendRaw = ctx.query('requireBullishTrend')
    const requireEarlyReversalRaw = ctx.query('requireEarlyReversal')
    let perMin = Utils.parseNumber(Utils.queryString(perMinRaw))
    let perMax = Utils.parseNumber(Utils.queryString(perMaxRaw))
    let roeMin = Utils.parseNumber(Utils.queryString(roeMinRaw))
    let derMax = Utils.parseNumber(Utils.queryString(derMaxRaw))
    let pbvMax = Utils.parseNumber(Utils.queryString(pbvMaxRaw))
    let minMarketCapital = Utils.parseNumber(Utils.queryString(minMarketCapitalRaw))
    let netMarginMin = Utils.parseNumber(Utils.queryString(netMarginMinRaw))
    let momentumMin = Utils.parseNumber(Utils.queryString(momentumMinRaw))
    let momentumWeek = Utils.parseWeek(Utils.queryString(momentumWeekRaw))
    const relativeStrengthMin = Utils.parseNumber(Utils.queryString(relativeStrengthRaw))
    const smartMoneyOnly = Utils.parseBoolean(Utils.queryString(smartMoneyOnlyRaw))
    const requireBullishTrend = Utils.parseBoolean(Utils.queryString(requireBullishTrendRaw))
    const requireEarlyReversal = Utils.parseBoolean(Utils.queryString(requireEarlyReversalRaw))
    const defaultFilter = Utils.parseBoolean(Utils.queryString(ctx.query('defaultFilter')))
    const includeRejected = Utils.parseBoolean(Utils.queryString(ctx.query('includeRejected')))
    if (defaultFilter) {
      if (!Utils.queryParamSent(excludeNotationRaw)) {
        excludeNotation = true
      }
      if (!Utils.queryParamSent(excludeCorpActionRaw)) {
        excludeCorpAction = true
      }
      if (!Utils.queryParamSent(excludeUmaRaw)) {
        excludeUma = true
      }
      // Default values tuned per setup
      if (setup === 'fundamental') {
        if (!Utils.queryParamSent(perMinRaw)) {
          perMin = 3
        }
        if (!Utils.queryParamSent(perMaxRaw)) {
          perMax = 18
        }
        if (!Utils.queryParamSent(roeMinRaw)) {
          roeMin = 15
        }
        if (!Utils.queryParamSent(derMaxRaw)) {
          derMax = 0.8
        }
        if (!Utils.queryParamSent(momentumWeekRaw)) {
          momentumWeek = 13
        }
        if (!Utils.queryParamSent(momentumMinRaw)) {
          momentumMin = 10
        }
        if (!Utils.queryParamSent(minValueRaw)) {
          minValue = 10_000_000_000
        }
        if (!Utils.queryParamSent(minVolumeRaw)) {
          minVolume = 1_000_000
        }
        // default exclude flags for fundamental
        if (!Utils.queryParamSent(excludeNotationRaw)) {
          excludeNotation = true
        }
        if (!Utils.queryParamSent(excludeCorpActionRaw)) {
          excludeCorpAction = true
        }
        if (!Utils.queryParamSent(excludeUmaRaw)) {
          excludeUma = true
        }
      } else {
        if (!Utils.queryParamSent(perMaxRaw)) {
          perMax = 25
        }
        if (!Utils.queryParamSent(roeMinRaw)) {
          roeMin = 0
        }
        if (!Utils.queryParamSent(derMaxRaw)) {
          derMax = 2
        }
      }
      if (!Utils.queryParamSent(pbvMaxRaw)) {
        pbvMax = undefined
      }
      if (!Utils.queryParamSent(minMarketCapitalRaw)) {
        minMarketCapital = undefined
      }
      if (!Utils.queryParamSent(netMarginMinRaw)) {
        netMarginMin = undefined
      }
      if (!Utils.queryParamSent(momentumMinRaw)) {
        // if not set above for fundamental, fall back to 0
        momentumMin = momentumMin ?? 0
      }
      if (!Utils.queryParamSent(momentumWeekRaw)) {
        momentumWeek = momentumWeek ?? 26
      }
    }
    const { limit, offset } = Utils.parseLimitOffset(
      Utils.queryString(ctx.query('limit')),
      Utils.queryString(ctx.query('offset'))
    )
    const withSectorRank = Utils.parseBoolean(Utils.queryString(ctx.query('withSectorRank')))
    const valueWeightRaw = ctx.query('vw')
    const qualityWeightRaw = ctx.query('qw')
    const momentumWeightRaw = ctx.query('mw')
    const valueWeight = Utils.parseWeight(Utils.queryString(valueWeightRaw))
    const qualityWeight = Utils.parseWeight(Utils.queryString(qualityWeightRaw))
    const momentumWeight = Utils.parseWeight(Utils.queryString(momentumWeightRaw))
    const compositeWeights = Utils.buildCompositeWeights(
      valueWeight,
      qualityWeight,
      momentumWeight
    ) as Types.CompositeWeights | undefined
    let summaryDate = dateInt
    let summaryRows = await Database.select({
      stockCode: Schemas.summary.stockCode,
      value: Schemas.summary.value,
      volume: Schemas.summary.volume,
      change: Schemas.summary.change,
      previous: Schemas.summary.previous
    })
      .from(Schemas.summary)
      .where(eq(Schemas.summary.date, dateInt))
    if (summaryRows.length === 0) {
      const latestRows = await Database.select({ date: Schemas.summary.date })
        .from(Schemas.summary)
        .orderBy(desc(Schemas.summary.date))
        .limit(1)
      const latestDate = latestRows[0]?.date
      if (latestDate != null && Number.isFinite(latestDate)) {
        summaryDate = Number(latestDate)
        summaryRows = await Database.select({
          stockCode: Schemas.summary.stockCode,
          value: Schemas.summary.value,
          volume: Schemas.summary.volume,
          change: Schemas.summary.change,
          previous: Schemas.summary.previous
        })
          .from(Schemas.summary)
          .where(eq(Schemas.summary.date, summaryDate))
      }
    }
    const codeToLiquidity = new Map<string, Types.LiquiditySnapshot>()
    const codeToChangePct = new Map<string, number | null>()
    for (const row of summaryRows) {
      codeToLiquidity.set(row.stockCode, {
        value: row.value,
        volume: row.volume
      })
      const changePct = Utils.changePctFromPrevious(row.change, row.previous)
      codeToChangePct.set(row.stockCode, changePct)
    }
    const historyStart = Utils.addDaysToDateInt(summaryDate, -460)
    const historyRows = await Database.select({
      stockCode: Schemas.summary.stockCode,
      date: Schemas.summary.date,
      priceHigh: Schemas.summary.priceHigh,
      priceLow: Schemas.summary.priceLow,
      priceClose: Schemas.summary.priceClose,
      volume: Schemas.summary.volume
    })
      .from(Schemas.summary)
      .where(and(gte(Schemas.summary.date, historyStart), lte(Schemas.summary.date, summaryDate)))
    const codeToTechnical = Services.Technical.computeByCode(
      historyRows.map((row) => ({
        stockCode: row.stockCode,
        date: Number(row.date),
        priceHigh: row.priceHigh,
        priceLow: row.priceLow,
        priceClose: row.priceClose,
        volume: row.volume
      }))
    )
    // compute average volume/value over previous 20 trading days (exclude latest)
    const rowsByCode = new Map<string, typeof historyRows>()
    for (const r of historyRows) {
      const list = rowsByCode.get(r.stockCode) ?? []
      list.push(r)
      rowsByCode.set(r.stockCode, list)
    }
    const codeToAvgVolume20 = new Map<string, number | null>()
    const codeToAvgValue20 = new Map<string, number | null>()
    const codeToReturnByWeek = new Map<string, Map<1 | 4 | 13 | 26, number | null>>()
    for (const [code, rows] of rowsByCode.entries()) {
      const sorted = rows.sort((a, b) => Number(a.date) - Number(b.date))
      const volumes = sorted.map((r) => r.volume).filter((v): v is number => v != null)
      const closes = sorted.map((r) => r.priceClose).filter((v): v is number => v != null)
      const prevVolumes = volumes.length > 1 ? volumes.slice(-21, -1) : []
      const avgVol = prevVolumes.length > 0
        ? prevVolumes.reduce((s, x) => s + x, 0) / prevVolumes.length
        : null
      const avgClose = closes.length > 0 ? closes[closes.length - 1] ?? null : null
      codeToAvgVolume20.set(code, avgVol)
      codeToAvgValue20.set(code, avgVol != null && avgClose != null ? avgVol * avgClose : null)
      const periodRows = sorted.map((row) => ({
        date: Number(row.date),
        priceClose: row.priceClose != null ? Number(row.priceClose) : null
      }))
      codeToReturnByWeek.set(
        code,
        new Map([
          [1, computeReturnForWeek(periodRows, summaryDate, 1)],
          [4, computeReturnForWeek(periodRows, summaryDate, 4)],
          [13, computeReturnForWeek(periodRows, summaryDate, 13)],
          [26, computeReturnForWeek(periodRows, summaryDate, 26)]
        ])
      )
    }
    const screenerRows = await Database.select({
      code: Schemas.screener.code,
      name: Schemas.screener.name,
      sector: Schemas.screener.sector,
      marketCapital: Schemas.screener.marketCapital,
      per: Schemas.screener.per,
      pbv: Schemas.screener.pbv,
      roa: Schemas.screener.roa,
      roe: Schemas.screener.roe,
      der: Schemas.screener.der,
      week4PC: Schemas.screener.week4PC,
      week13PC: Schemas.screener.week13PC,
      week26PC: Schemas.screener.week26PC,
      week52PC: Schemas.screener.week52PC,
      npm: Schemas.screener.npm,
      notation: Schemas.screener.notation,
      corpAction: Schemas.screener.corpAction,
      umaDate: Schemas.screener.umaDate
    }).from(Schemas.screener)
    const fundamentalFilter = {
      ...(perMin != null && { perMin }),
      ...(perMax != null && { perMax }),
      ...(roeMin != null && { roeMin }),
      ...(derMax != null && { derMax }),
      ...(pbvMax != null && { pbvMax }),
      ...(minMarketCapital != null && { minMarketCapital }),
      ...(netMarginMin != null && { netMarginMin }),
      ...(momentumMin != null && { momentumMin }),
      momentumWeek
    }
    const screenerRowsWithShortMomentum = screenerRows.map((row) => ({
      ...row,
      week1PC: codeToReturnByWeek.get(row.code)?.get(1) ?? null,
      week4PC: codeToReturnByWeek.get(row.code)?.get(4) ?? row.week4PC,
      week13PC: codeToReturnByWeek.get(row.code)?.get(13) ?? row.week13PC,
      week26PC: codeToReturnByWeek.get(row.code)?.get(26) ?? row.week26PC
    }))
    const filteredScreenerRows = screenerRowsWithShortMomentum.filter((row) =>
      Utils.screenerPassesFundamentalFilter(row, fundamentalFilter)
    )
    const rowsForScore: Types.ScreenerRow[] = filteredScreenerRows.map((row) => ({
      code: row.code,
      name: row.name,
      sector: row.sector,
      per: row.per,
      pbv: row.pbv,
      roa: row.roa,
      roe: row.roe,
      der: row.der,
      week1PC: row.week1PC,
      week4PC: row.week4PC,
      week13PC: row.week13PC,
      week26PC: row.week26PC,
      week52PC: row.week52PC
    }))
    const rankedRows = Services.Composite.computeRanked(rowsForScore, compositeWeights)
    const codeToFlags = new Map<string, Types.CodeFlags>()
    for (const row of filteredScreenerRows) {
      codeToFlags.set(row.code, {
        notation: row.notation,
        corpAction: row.corpAction,
        umaDate: row.umaDate
      })
    }
    const codeToFundamentals = Utils.toFundamentalsMap(filteredScreenerRows)
    const codeToMarketCapital = new Map<string, number | null>()
    for (const row of filteredScreenerRows) {
      codeToMarketCapital.set(row.code, row.marketCapital ?? null)
    }
    const withFlagsAndLiquidity: Types.CandidateRow[] = rankedRows.map((row) => {
      const flags = codeToFlags.get(row.code)
      const hasNotation = Utils.isNonEmptyString(flags?.notation)
      const hasCorpAction = Utils.isNonEmptyString(flags?.corpAction)
      const hasUma = Utils.isNonEmptyString(flags?.umaDate)
      const liquidity = codeToLiquidity.get(row.code)
      const transactionValue = liquidity?.value ?? null
      const volume = liquidity?.volume ?? null
      const fundamentals = codeToFundamentals.get(row.code)
      const changePct = codeToChangePct.get(row.code) ?? null
      const technical = codeToTechnical.get(row.code)
      return {
        ...row,
        hasNotation,
        hasCorpAction,
        hasUma,
        marketCapital: codeToMarketCapital.get(row.code) ?? null,
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
    // start with unfiltered candidates (may be replaced by enhancedCandidates later)
    let filteredCandidates: Types.CandidateRow[] | Types.CandidateRowWithSectorRank[] =
      withFlagsAndLiquidity
    // Attach advanced scores, liquidity normalization, relative strength and trend flags
    const avgVolList: number[] = []
    const avgValList: number[] = []
    for (const r of withFlagsAndLiquidity) {
      const av = codeToAvgVolume20.get(r.code) ?? null
      const avv = codeToAvgValue20.get(r.code) ?? null
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
    const periodReturns = rowsForScore.map((r) => {
      const week = momentumWeek
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
    const codeToRanked = new Map(rankedRows.map((r) => [r.code, r]))
    const enhancedCandidates: Types.CandidateRow[] = []
    for (const row of withFlagsAndLiquidity) {
      const avgVol = codeToAvgVolume20.get(row.code) ?? null
      const avgVal = codeToAvgValue20.get(row.code) ?? null
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
      const stockReturn = momentumWeek === 1
        ? (row.week1PC ?? 0)
        : momentumWeek === 4
        ? (row.week4PC ?? 0)
        : momentumWeek === 13
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
    filteredCandidates = enhancedCandidates
    if (relativeStrengthMin != null) {
      filteredCandidates = filteredCandidates.filter((r) =>
        (r.relativeStrength ?? 0) >= relativeStrengthMin
      )
    }
    if (smartMoneyOnly) {
      filteredCandidates = filteredCandidates.filter((r) => r.smartMoney === true)
    }
    if (requireBullishTrend) {
      filteredCandidates = filteredCandidates.filter((r) => r.bullishTrend === true)
    }
    if (requireEarlyReversal) {
      filteredCandidates = filteredCandidates.filter((r) => r.earlyReversal === true)
    }
    let withSectorRankApplied: Types.CandidateRow[] | Types.CandidateRowWithSectorRank[] =
      filteredCandidates
    if (withSectorRank) {
      const bySector = new Map<string, Types.CandidateRow[]>()
      for (const row of filteredCandidates as Types.CandidateRow[]) {
        Utils.pushToMapList(bySector, row.sector ?? '', row as Types.CandidateRow)
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
      withSectorRankApplied = candidatesWithSectorRank
    }
    filteredCandidates = withSectorRankApplied
    if (excludeNotation) {
      filteredCandidates = filteredCandidates.filter((row) => !row.hasNotation)
    }
    if (excludeCorpAction) {
      filteredCandidates = filteredCandidates.filter((row) => !row.hasCorpAction)
    }
    if (excludeUma) {
      filteredCandidates = filteredCandidates.filter((row) => !row.hasUma)
    }
    if (minValue != null) {
      filteredCandidates = filteredCandidates.filter((row) =>
        (setup === 'fundamental' ? row.avgValue20 ?? row.value ?? 0 : row.value ?? 0) >= minValue
      )
    }
    if (minVolume != null) {
      filteredCandidates = filteredCandidates.filter((row) =>
        (setup === 'fundamental' ? row.avgVolume20 ?? row.volume ?? 0 : row.volume ?? 0) >=
          minVolume
      )
    }
    // Always apply setup mapping & filtering; sort differently for fundamental preset
    filteredCandidates = filteredCandidates
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

    if (setup === 'fundamental') {
      filteredCandidates.sort((a, b) =>
        (b.recommendationScore - a.recommendationScore) ||
        ((b.roe ?? 0) - (a.roe ?? 0)) ||
        ((b.momentumScore ?? 0) - (a.momentumScore ?? 0)) ||
        // cheaper PER first
        ((a.per ?? Number.MAX_VALUE) - (b.per ?? Number.MAX_VALUE)) ||
        ((b.liquidityScore ?? 0) - (a.liquidityScore ?? 0))
      )
    } else {
      filteredCandidates.sort(
        (a, b) =>
          (b.recommendationScore - a.recommendationScore) || (b.compositeScore - a.compositeScore)
      )
    }
    const sectorParam = Utils.queryString(ctx.query('sector'))?.trim()
    if (sectorParam !== undefined && sectorParam !== '') {
      filteredCandidates = filteredCandidates.filter(
        (row) => row.sector != null && row.sector.trim() === sectorParam
      )
    }
    const searchParam = Utils.queryString(ctx.query('search'))?.trim().toLowerCase()
    if (searchParam !== undefined && searchParam !== '') {
      filteredCandidates = filteredCandidates.filter((row) => {
        const code = row.code?.toLowerCase() ?? ''
        const name = row.name?.toLowerCase() ?? ''
        const sector = row.sector?.toLowerCase() ?? ''
        return (
          code.includes(searchParam) || name.includes(searchParam) || sector.includes(searchParam)
        )
      })
    }
    const totalCount = filteredCandidates.length
    // Final ranking: Score, ROE, Momentum, cheapest PER, Liquidity.
    filteredCandidates.sort((a, b) =>
      (b.recommendationScore ?? b.totalScore ?? 0) - (a.recommendationScore ?? a.totalScore ?? 0) ||
      ((b.roe ?? 0) - (a.roe ?? 0)) ||
      ((b.momentumScore ?? 0) - (a.momentumScore ?? 0)) ||
      ((a.per ?? Number.MAX_VALUE) - (b.per ?? Number.MAX_VALUE)) ||
      ((b.liquidityScore ?? 0) - (a.liquidityScore ?? 0))
    )
    const withPercentile = filteredCandidates.map((row, index) => ({
      ...row,
      compositePercentile: Utils.compositePercentile(index, totalCount)
    }))
    const { data } = Utils.applyPagination(withPercentile, offset, limit)
    const dataWithSentiment: Types.CandidateRow[] = data

    // If requested, fetch news sentiment for the paginated items only to limit external calls
    const requireNews = Utils.parseBoolean(Utils.queryString(ctx.query('requireNewsSentiment')))
    const minNewsSentiment = Utils.parseNumber(Utils.queryString(ctx.query('minNewsSentiment')))
    if (requireNews) {
      const newsService = new Services.News(new Services.Client())
      await Promise.all(dataWithSentiment.map(async (row) => {
        try {
          const { score, count, label, titles } = await newsService.scoreCompany(row.code, row.name) // attach to row
          row.newsSentimentScore = score
          row.newsSentimentCount = count
          row.newsSentimentLabel = label
          row.newsSentimentTitles = titles
          if (count === 0) {
            console.info(`[candidates] no news articles for ${row.code}`)
          }
        } catch (_e) {
          row.newsSentimentScore = 0
          row.newsSentimentCount = 0
          row.newsSentimentLabel = 'neutral'
          row.newsSentimentTitles = []
        }
      }))
      if (minNewsSentiment != null) {
        // filter rows by minNewsSentiment threshold
        for (let i = dataWithSentiment.length - 1; i >= 0; i--) {
          const s = dataWithSentiment[i]?.newsSentimentScore ?? 0
          if (s < minNewsSentiment) {
            dataWithSentiment.splice(i, 1)
          }
        }
      }
    }
    const response: Types.CandidatesResponse = {
      date: summaryDate,
      totalCount,
      limit,
      offset,
      serverTimestamp: new Date().toISOString(),
      data: dataWithSentiment
    }
    return ctx.send.json(response)
  } catch (err) {
    console.error('[candidates] handler error', err)
    const safeResp: Types.CandidatesResponse = {
      date: dateInt,
      totalCount: 0,
      limit: 0,
      offset: 0,
      serverTimestamp: new Date().toISOString(),
      data: []
    }
    return ctx.send.json(safeResp)
  }
}
