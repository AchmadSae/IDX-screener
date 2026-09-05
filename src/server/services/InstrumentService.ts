/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Reads/writes for the forex/metals instruments table and its OHLC bars,
 * with lazy Yahoo Finance top-up when stored data is stale.
 */

import { desc, eq, asc, and, gte, lte } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { CronDate } from '@app/server/services/Date.ts'
import { YahooFinance, type DailyBar } from '@app/server/services/YahooFinance.ts'

export type InstrumentListItem = {
  symbol: string
  displayName: string
  assetClass: string
  currency: string | null
  exchange: string | null
  provider: string | null
  latestPrice: number | null
  latestDateInt: number | null
  dayChangePct: number | null
}

export type MarketOhlcBar = DailyBar

const YAHOO_RANGE = '1y'

export class InstrumentService {
  static async bySymbol(symbol: string) {
    const rows = await Database.select()
      .from(Schemas.instruments)
      .where(eq(Schemas.instruments.symbol, symbol))
      .limit(1)
    return rows[0] ?? null
  }

  static async isKnown(symbol: string): Promise<boolean> {
    return (await InstrumentService.bySymbol(symbol)) != null
  }

  static async list(): Promise<InstrumentListItem[]> {
    const instruments = await Database.select()
      .from(Schemas.instruments)
      .orderBy(asc(Schemas.instruments.symbol))
    if (instruments.length === 0) {
      return []
    }
    const items: InstrumentListItem[] = []
    for (const instrument of instruments) {
      const bars = await InstrumentService.latestBars(instrument.symbol, 2)
      const latest = bars[bars.length - 1] ?? null
      const previous = bars.length > 1 ? bars[bars.length - 2]! : null
      items.push({
        symbol: instrument.symbol,
        displayName: instrument.displayName,
        assetClass: instrument.assetClass,
        currency: instrument.currency,
        exchange: instrument.exchange,
        provider: instrument.provider,
        latestPrice: latest?.close ?? null,
        latestDateInt: latest?.dateInt ?? null,
        dayChangePct:
          latest != null && previous != null && previous.close > 0
            ? ((latest.close - previous.close) / previous.close) * 100
            : null
      })
    }
    return items
  }

  /**
   * Lazy top-up: fetches fresh Yahoo bars only when the latest stored bar is
   * older than the previous calendar day. Never throws — a failed fetch just
   * leaves cached data in place.
   */
  static async ensureFresh(symbol: string): Promise<void> {
    const instrument = await InstrumentService.bySymbol(symbol)
    if (instrument == null) {
      return
    }
    const latestBars = await InstrumentService.latestBars(symbol, 1)
    const latestDateInt = latestBars[0]?.dateInt ?? null
    const staleThreshold = CronDate.getDateIntForDayOffset(-1)
    if (latestDateInt != null && latestDateInt >= staleThreshold) {
      return
    }
    const fetched = await YahooFinance.fetchDailyBars(symbol, YAHOO_RANGE)
    if (!fetched.ok) {
      console.warn(`[instruments] Yahoo fetch failed for ${symbol}: ${fetched.error}`)
      return
    }
    await YahooFinance.upsertBars(instrument.id, fetched.bars)
  }

  /** Recent bars for a symbol, ascending by date. */
  static async latestBars(symbol: string, limit: number): Promise<MarketOhlcBar[]> {
    const instrument = await InstrumentService.bySymbol(symbol)
    if (instrument == null) {
      return []
    }
    const rows = await Database.select()
      .from(Schemas.marketOhlc)
      .where(eq(Schemas.marketOhlc.instrumentId, instrument.id))
      .orderBy(desc(Schemas.marketOhlc.dateInt))
      .limit(limit)
    return rows
      .map((row) => ({
        dateInt: row.dateInt,
        open: row.priceOpen,
        high: row.priceHigh,
        low: row.priceLow,
        close: row.priceClose,
        volume: row.volume
      }))
      .sort((first, second) => first.dateInt - second.dateInt)
  }

  /** Bars within an inclusive date range, ascending — used by outcome evaluation. */
  static async barsBetween(symbol: string, fromDateInt: number, toDateInt: number): Promise<MarketOhlcBar[]> {
    const instrument = await InstrumentService.bySymbol(symbol)
    if (instrument == null) {
      return []
    }
    const rows = await Database.select()
      .from(Schemas.marketOhlc)
      .where(
        and(
          eq(Schemas.marketOhlc.instrumentId, instrument.id),
          gte(Schemas.marketOhlc.dateInt, fromDateInt),
          lte(Schemas.marketOhlc.dateInt, toDateInt)
        )
      )
    return rows
      .map((row) => ({
        dateInt: row.dateInt,
        open: row.priceOpen,
        high: row.priceHigh,
        low: row.priceLow,
        close: row.priceClose,
        volume: row.volume
      }))
      .sort((first, second) => first.dateInt - second.dateInt)
  }
}
