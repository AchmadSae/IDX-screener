/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Yahoo Finance daily-bar provider for forex/metals instruments. Uses the
 * unofficial public chart endpoint — no API key required. Every failure is
 * captured as a typed result so callers degrade to cached data instead of
 * failing requests.
 */

import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'

export type DailyBar = {
  dateInt: number
  open: number | null
  high: number | null
  low: number | null
  close: number
  volume: number | null
}

export type FetchDailyBarsResult =
  | { ok: true; bars: DailyBar[] }
  | { ok: false; error: string }

type YahooChartResponse = {
  chart?: {
    result?: {
      timestamp?: number[]
      indicators?: {
        quote?: {
          open?: (number | null)[]
          high?: (number | null)[]
          low?: (number | null)[]
          close?: (number | null)[]
          volume?: (number | null)[]
        }[]
      }
    }[]
  }
}

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const REQUEST_TIMEOUT_MS = 10_000

/** Converts an internal symbol like `XAU/USD` to the Yahoo ticker `XAUUSD=X`. */
export function toYahooTicker(symbol: string): string {
  return `${symbol.replace('/', '')}=X`
}

/** Jakarta calendar date for a Yahoo unix-seconds timestamp. */
function jakartaDateIntFromUnixSeconds(unixSeconds: number): number {
  const date = new Date(unixSeconds * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return parseInt(`${byType['year']}${byType['month']}${byType['day']}`, 10)
}

export class YahooFinance {
  static async fetchDailyBars(symbol: string, range = '1y'): Promise<FetchDailyBarsResult> {
    const url =
      `${YAHOO_BASE}/${encodeURIComponent(toYahooTicker(symbol))}` +
      `?interval=1d&range=${range}&includePrePost=false&events=div%2Csplit`
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
      if (!response.ok) {
        return { ok: false, error: `Yahoo HTTP ${response.status}` }
      }
      const json = (await response.json()) as YahooChartResponse
      const result = json.chart?.result?.[0]
      if (result == null) {
        return { ok: false, error: 'empty chart result' }
      }
      const timestamps = result.timestamp ?? []
      const quote = result.indicators?.quote?.[0]
      const bars: DailyBar[] = []
      for (let index = 0; index < timestamps.length; index++) {
        const close = quote?.close?.[index]
        if (close == null || !Number.isFinite(close)) {
          continue
        }
        bars.push({
          dateInt: jakartaDateIntFromUnixSeconds(timestamps[index]!),
          open: quote?.open?.[index] ?? null,
          high: quote?.high?.[index] ?? null,
          low: quote?.low?.[index] ?? null,
          close,
          volume: quote?.volume?.[index] ?? null
        })
      }
      return { ok: true, bars }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /** Upserts bars keyed on (instrument, date). */
  static async upsertBars(instrumentId: string, bars: DailyBar[]): Promise<void> {
    if (bars.length === 0) {
      return
    }
    await Database.transaction(async (tx) => {
      for (const bar of bars) {
        const row = {
          instrumentId,
          dateInt: bar.dateInt,
          priceOpen: bar.open,
          priceHigh: bar.high,
          priceLow: bar.low,
          priceClose: bar.close,
          volume: bar.volume
        }
        await tx
          .insert(Schemas.marketOhlc)
          .values(row)
          .onConflictDoUpdate({
            target: [
              Schemas.marketOhlc.instrumentId,
              Schemas.marketOhlc.dateInt
            ],
            set: {
              priceOpen: row.priceOpen,
              priceHigh: row.priceHigh,
              priceLow: row.priceLow,
              priceClose: row.priceClose,
              volume: row.volume
            }
          })
      }
    })
  }
}
