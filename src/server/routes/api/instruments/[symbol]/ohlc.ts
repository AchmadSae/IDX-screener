/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { ApiError } from '@app/server/http/errors.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'

function parseDays(raw: string | undefined): number {
  if (raw === undefined || raw === '') {
    return 90
  }
  const days = Number(raw)
  if (!Number.isFinite(days) || days < 1) {
    throw ApiError.badRequest('INVALID_PARAM_DAYS', 'days must be a positive integer')
  }
  return Math.min(Math.floor(days), 365)
}

/**
 * GET /api/instruments/:symbol/ohlc?days=90 — flat chart series for Recharts.
 */
export async function GET(ctx: Context): Promise<void> {
  const symbol = (ctx.param('symbol') ?? '').toUpperCase()
  if (symbol === '') {
    throw ApiError.badRequest('INVALID_PARAM_SYMBOL', 'symbol is required')
  }
  const days = parseDays(ctx.query('days'))
  await InstrumentService.ensureFresh(symbol)
  const bars = await InstrumentService.latestBars(symbol, days)
  ctx.send.json({
    data: {
      symbol,
      dateInt: bars.map((bar) => bar.dateInt),
      priceOpen: bars.map((bar) => bar.open),
      priceHigh: bars.map((bar) => bar.high),
      priceLow: bars.map((bar) => bar.low),
      priceClose: bars.map((bar) => bar.close),
      volume: bars.map((bar) => bar.volume)
    }
  })
}
