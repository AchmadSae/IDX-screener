/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import RSI from '@app/server/RSI.ts'
import type * as Types from '@app/server/Types.ts'

function toFiniteNumber(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(Number(value))) {
    return null
  }
  return Number(value)
}

function round2(value: number | null): number | null {
  return value == null ? null : Math.round(value * 100) / 100
}

function average(values: number[]): number | null {
  const finiteValues = values.filter((value) => Number.isFinite(value))
  if (finiteValues.length === 0) {
    return null
  }
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length
}

function sma(values: number[], period: number): number | null {
  if (values.length < period) {
    return null
  }
  return average(values.slice(-period))
}

function ema(values: number[], period: number): number | null {
  if (values.length < period) {
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

function calculateDmi(
  rows: Types.TechnicalSummaryRow[],
  period = 14
): Pick<Types.TechnicalMetrics, 'adx14' | 'plusDi14' | 'minusDi14'> {
  if (rows.length < period * 2 + 1) {
    return { adx14: null, plusDi14: null, minusDi14: null }
  }
  const trValues: number[] = []
  const plusDmValues: number[] = []
  const minusDmValues: number[] = []
  for (let index = 1; index < rows.length; index++) {
    const previous = rows[index - 1]!
    const current = rows[index]!
    const high = toFiniteNumber(current.priceHigh)
    const low = toFiniteNumber(current.priceLow)
    const closePrev = toFiniteNumber(previous.priceClose)
    const highPrev = toFiniteNumber(previous.priceHigh)
    const lowPrev = toFiniteNumber(previous.priceLow)
    if (high == null || low == null || closePrev == null || highPrev == null || lowPrev == null) {
      continue
    }
    const upMove = high - highPrev
    const downMove = lowPrev - low
    plusDmValues.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDmValues.push(downMove > upMove && downMove > 0 ? downMove : 0)
    trValues.push(Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev)))
  }
  if (trValues.length < period * 2) {
    return { adx14: null, plusDi14: null, minusDi14: null }
  }

  let tr = trValues.slice(0, period).reduce((sum, value) => sum + value, 0)
  let plusDm = plusDmValues.slice(0, period).reduce((sum, value) => sum + value, 0)
  let minusDm = minusDmValues.slice(0, period).reduce((sum, value) => sum + value, 0)
  let plusDi = tr > 0 ? (100 * plusDm) / tr : 0
  let minusDi = tr > 0 ? (100 * minusDm) / tr : 0
  const dxValues: number[] = []
  const firstDxBase = plusDi + minusDi
  dxValues.push(firstDxBase > 0 ? (100 * Math.abs(plusDi - minusDi)) / firstDxBase : 0)

  for (let index = period; index < trValues.length; index++) {
    tr = tr - tr / period + trValues[index]!
    plusDm = plusDm - plusDm / period + plusDmValues[index]!
    minusDm = minusDm - minusDm / period + minusDmValues[index]!
    plusDi = tr > 0 ? (100 * plusDm) / tr : 0
    minusDi = tr > 0 ? (100 * minusDm) / tr : 0
    const dxBase = plusDi + minusDi
    dxValues.push(dxBase > 0 ? (100 * Math.abs(plusDi - minusDi)) / dxBase : 0)
  }
  if (dxValues.length < period) {
    return { adx14: null, plusDi14: round2(plusDi), minusDi14: round2(minusDi) }
  }
  let adx = dxValues.slice(0, period).reduce((sum, value) => sum + value, 0) / period
  for (const value of dxValues.slice(period)) {
    adx = (adx * (period - 1) + value) / period
  }
  return { adx14: round2(adx), plusDi14: round2(plusDi), minusDi14: round2(minusDi) }
}

export class Technical {
  static computeByCode(rows: Types.TechnicalSummaryRow[]): Map<string, Types.TechnicalMetrics> {
    const rowsByCode = new Map<string, Types.TechnicalSummaryRow[]>()
    for (const row of rows) {
      const list = rowsByCode.get(row.stockCode) ?? []
      list.push(row)
      rowsByCode.set(row.stockCode, list)
    }

    const result = new Map<string, Types.TechnicalMetrics>()
    for (const [stockCode, codeRows] of rowsByCode.entries()) {
      const sortedRows = [...codeRows].sort((a, b) => Number(a.date) - Number(b.date))
      const closes = sortedRows
        .map((row) => toFiniteNumber(row.priceClose))
        .filter((value): value is number => value != null)
      const volumes = sortedRows
        .map((row) => toFiniteNumber(row.volume))
        .filter((value): value is number => value != null)
      const latest = sortedRows[sortedRows.length - 1]
      const price = toFiniteNumber(latest?.priceClose)
      const latestVolume = toFiniteNumber(latest?.volume)
      const previousVolumeAverage = volumes.length > 1 ? average(volumes.slice(-21, -1)) : null
      const rsiValues = RSI.calculate(closes, RSI.defaultPeriod)
      const rsi = rsiValues[rsiValues.length - 1] ?? null
      const close10 = closes.length > 10 ? closes[closes.length - 11]! : null
      const momentum10 = close10 != null && close10 > 0 && price != null
        ? ((price - close10) / close10) * 100
        : null

      result.set(stockCode, {
        price: round2(price),
        rsi14: round2(rsi),
        relVolume: previousVolumeAverage != null && previousVolumeAverage > 0 &&
            latestVolume != null
          ? round2(latestVolume / previousVolumeAverage)
          : null,
        ema10: round2(ema(closes, 10)),
        ema20: round2(ema(closes, 20)),
        ema50: round2(ema(closes, 50)),
        ema200: round2(ema(closes, 200)),
        bbBasis20: round2(sma(closes, 20)),
        momentum10: round2(momentum10),
        ...calculateDmi(sortedRows)
      })
    }
    return result
  }
}
