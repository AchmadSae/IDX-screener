/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { doublePrecision, pgTable, text } from 'drizzle-orm/pg-core'

export const screener = pgTable('stock_screener', {
  code: text('code').primaryKey(),
  name: text('name'),
  industry: text('industry'),
  sector: text('sector'),
  subSector: text('sub_sector'),
  subIndustry: text('sub_industry'),
  subIndustryCode: text('sub_industry_code'),
  indexCode: text('index_code'),
  marketCapital: doublePrecision('market_capital'),
  totalRevenue: doublePrecision('total_revenue'),
  npm: doublePrecision('npm'),
  per: doublePrecision('per'),
  pbv: doublePrecision('pbv'),
  roa: doublePrecision('roa'),
  roe: doublePrecision('roe'),
  der: doublePrecision('der'),
  week4PC: doublePrecision('week4_pc'),
  week13PC: doublePrecision('week13_pc'),
  week26PC: doublePrecision('week26_pc'),
  week52PC: doublePrecision('week52_pc'),
  ytdpc: doublePrecision('ytdpc'),
  mtdpc: doublePrecision('mtdpc'),
  umaDate: text('uma_date'),
  notation: text('notation'),
  status: text('status'),
  corpAction: text('corp_action'),
  corpActionDate: text('corp_action_date')
})
