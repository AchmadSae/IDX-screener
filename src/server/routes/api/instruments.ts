/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { CronDate } from '@app/server/services/Date.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'

/**
 * GET /api/instruments — forex/metals instruments with latest price and day
 * change. Backfills Yahoo data lazily when stale; always degrades to cached
 * data instead of failing.
 */
export async function GET(ctx: Context): Promise<void> {
  const items = await InstrumentService.list()
  await Promise.allSettled(
    items.map((item) => InstrumentService.ensureFresh(item.symbol))
  )
  const refreshed = await InstrumentService.list()
  const yesterday = CronDate.getDateIntForDayOffset(-1)
  const stale = refreshed.some(
    (item) => item.latestDateInt == null || item.latestDateInt < yesterday
  )
  ctx.send.json({ data: refreshed, stale })
}
