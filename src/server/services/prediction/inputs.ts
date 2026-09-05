/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Assembles the pure `RuleInput` from stored data: `stock_summary` +
 * `stock_screener` for stocks, `market_ohlc` (with lazy Yahoo top-up) for
 * forex/metals.
 */

import { desc, eq } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { ApiError } from '@app/server/http/errors.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'
import { atr14, ema, realizedVol20, returnOverBars, rsi14 } from '@app/server/services/prediction/indicators.ts'
import type {
  FundamentalInput,
  IndicatorInput,
  PredictionAssetClass,
  PredictionStrategy,
  RuleInput
} from '@app/server/services/prediction/rules.ts'

const HISTORY_BARS = 120

export type AssembledPredictionInput = {
  ruleInput: RuleInput
  /** Bounded close series (last ~90 bars) for the DeepSeek prompt payload. */
  closes: number[]
}

export async function latestStockSnapshot(symbol: string): Promise<{
  entryPrice: number | null
  fundamentals: FundamentalInput | null
}> {
  const latestSummary = await Database.select({
    priceClose: Schemas.summary.priceClose
  })
    .from(Schemas.summary)
    .where(eq(Schemas.summary.stockCode, symbol))
    .orderBy(desc(Schemas.summary.date))
    .limit(1)

  const screenerRows = await Database.select({
    roe: Schemas.screener.roe,
    der: Schemas.screener.der,
    per: Schemas.screener.per,
    week13PC: Schemas.screener.week13PC,
    week26PC: Schemas.screener.week26PC
  })
    .from(Schemas.screener)
    .where(eq(Schemas.screener.code, symbol))
    .limit(1)

  const screener = screenerRows[0]
  const fundamentals =
    screener == null
      ? null
      : {
          roe: screener.roe,
          der: screener.der,
          per: screener.per,
          week13PC: screener.week13PC,
          week26PC: screener.week26PC
        }
  return {
    entryPrice: latestSummary[0]?.priceClose ?? null,
    fundamentals
  }
}

/** Indicator bundle from an OHLC series (ascending), with entry price context. */
export function indicatorsFromBars(
  bars: { high: number | null; low: number | null; close: number }[],
  entryPrice: number
): IndicatorInput | null {
  const closes = bars.map((bar) => bar.close)
  if (closes.length < 3 || entryPrice <= 0) {
    return null
  }
  const highs = bars.map((bar) => bar.high)
  const lows = bars.map((bar) => bar.low)
  const atr = atr14(highs, lows, closes)
  return {
    price: closes[closes.length - 1]!,
    rsi14: rsi14(closes),
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    ema200: ema(closes, 200),
    atrPct: atr != null ? (atr / entryPrice) * 100 : null,
    realizedVolPct: realizedVol20(closes),
    return20Pct: returnOverBars(closes, 20),
    barCount: closes.length
  }
}

async function stockBars(symbol: string): Promise<
  { high: number | null; low: number | null; close: number }[]
> {
  const rows = await Database.select({
    date: Schemas.summary.date,
    priceHigh: Schemas.summary.priceHigh,
    priceLow: Schemas.summary.priceLow,
    priceClose: Schemas.summary.priceClose
  })
    .from(Schemas.summary)
    .where(eq(Schemas.summary.stockCode, symbol))
    .orderBy(desc(Schemas.summary.date))
    .limit(HISTORY_BARS)
  return rows
    .reverse() // latest `HISTORY_BARS` rows, ascending
    .map((row) => ({
      high: row.priceHigh,
      low: row.priceLow,
      close: row.priceClose
    }))
    .filter((bar): bar is { high: number | null; low: number | null; close: number } =>
      bar.close != null && Number.isFinite(bar.close)
    )
}

export async function assembleRuleInput(
  symbol: string,
  assetClass: PredictionAssetClass,
  strategy: PredictionStrategy,
  currentPrice?: number
): Promise<AssembledPredictionInput> {
  if (assetClass === 'stock') {
    const snapshot = await latestStockSnapshot(symbol)
    const entryPrice = currentPrice ?? snapshot.entryPrice
    if (entryPrice == null || !Number.isFinite(entryPrice) || entryPrice <= 0) {
      throw ApiError.conflict(
        'PRICE_UNAVAILABLE',
        'currentPrice is required when no stored latest price is available'
      )
    }
    const bars = await stockBars(symbol)
    const indicators = bars.length >= 3 ? indicatorsFromBars(bars, entryPrice) : null
    return {
      ruleInput: {
        symbol,
        assetClass,
        strategy,
        entryPrice,
        fundamentals: snapshot.fundamentals,
        indicators
      },
      closes: bars.map((bar) => bar.close).slice(-90)
    }
  }

  await InstrumentService.ensureFresh(symbol)
  const bars = await InstrumentService.latestBars(symbol, HISTORY_BARS)
  const latestClose = bars.length > 0 ? bars[bars.length - 1]!.close : null
  const entryPrice = currentPrice ?? latestClose
  if (entryPrice == null || !Number.isFinite(entryPrice) || entryPrice <= 0) {
    throw ApiError.conflict(
      'PRICE_UNAVAILABLE',
      `No stored price for ${symbol} and currentPrice was not provided. ` +
        'Run the ingestion job or supply a current price.'
    )
  }
  const indicators = bars.length >= 3 ? indicatorsFromBars(bars, entryPrice) : null
  return {
    ruleInput: {
      symbol,
      assetClass,
      strategy,
      entryPrice,
      fundamentals: null,
      indicators
    },
    closes: bars.map((bar) => bar.close).slice(-90)
  }
}
