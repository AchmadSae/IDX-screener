/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { doublePrecision, pgTable, text } from 'drizzle-orm/pg-core'

export const summary = pgTable('stock_summary', {
  id: text('id').primaryKey(),
  date: doublePrecision('date').notNull(),
  stockCode: text('stock_code').notNull(),
  stockName: text('stock_name'),
  remarks: text('remarks'),
  previous: doublePrecision('previous'),
  firstTrade: doublePrecision('first_trade'),
  priceOpen: doublePrecision('price_open'),
  priceHigh: doublePrecision('price_high'),
  priceLow: doublePrecision('price_low'),
  priceClose: doublePrecision('price_close'),
  change: doublePrecision('change'),
  volume: doublePrecision('volume'),
  value: doublePrecision('value'),
  frequency: doublePrecision('frequency'),
  individualIndex: doublePrecision('individual_index'),
  weightForIndex: doublePrecision('weight_for_index'),
  offerValue: doublePrecision('offer_value'),
  offerVolume: doublePrecision('offer_volume'),
  bidValue: doublePrecision('bid_value'),
  bidVolume: doublePrecision('bid_volume'),
  listedShares: doublePrecision('listed_shares'),
  tradableShares: doublePrecision('tradable_shares'),
  foreignBuy: doublePrecision('foreign_buy'),
  foreignSell: doublePrecision('foreign_sell')
})
