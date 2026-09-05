/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Loads the market data bundle the candidates use-case consumes: latest
 * summary snapshot (with date fallback), liquidity/change maps, technical
 * indicators over ~460 days of history, 20-day averages, weekly returns, and
 * the screener classification rows. Extracted verbatim from the candidates
 * route — behavior is unchanged.
 */

import { and, desc, eq, gte, lte } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import Utils from '@app/server/Utils.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import * as Services from '@app/server/services/index.ts'
import type * as Types from '@app/server/Types.ts'

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

export type ScreenerProjectedRow = {
  code: string
  name: string | null
  sector: string | null
  marketCapital: number | null
  per: number | null
  pbv: number | null
  roa: number | null
  roe: number | null
  der: number | null
  week4PC: number | null
  week13PC: number | null
  week26PC: number | null
  week52PC: number | null
  npm: number | null
  notation: string | null
  corpAction: string | null
  umaDate: string | null
}

export type MarketDataBundle = {
  summaryDate: number
  codeToLiquidity: Map<string, Types.LiquiditySnapshot>
  codeToChangePct: Map<string, number | null>
  codeToTechnical: Map<string, Types.TechnicalMetrics>
  codeToAvgVolume20: Map<string, number | null>
  codeToAvgValue20: Map<string, number | null>
  codeToReturnByWeek: Map<string, Map<1 | 4 | 13 | 26, number | null>>
  screenerRows: ScreenerProjectedRow[]
}

export async function loadMarketData(dateInt: number): Promise<MarketDataBundle> {
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

  return {
    summaryDate,
    codeToLiquidity,
    codeToChangePct,
    codeToTechnical,
    codeToAvgVolume20,
    codeToAvgValue20,
    codeToReturnByWeek,
    screenerRows
  }
}
