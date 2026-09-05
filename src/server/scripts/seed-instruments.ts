/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import 'dotenv/config'
import { initDb } from '@app/server/Database.ts'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'

type SeedInstrument = {
  symbol: string
  displayName: string
  assetClass: 'forex' | 'metal'
  currency: string
}

const SEED_INSTRUMENTS: SeedInstrument[] = [
  { symbol: 'XAU/USD', displayName: 'Gold Spot', assetClass: 'metal', currency: 'USD' },
  { symbol: 'XAG/USD', displayName: 'Silver Spot', assetClass: 'metal', currency: 'USD' },
  { symbol: 'AUD/USD', displayName: 'Australian Dollar', assetClass: 'forex', currency: 'USD' },
  { symbol: 'EUR/USD', displayName: 'Euro', assetClass: 'forex', currency: 'USD' },
  { symbol: 'GBP/USD', displayName: 'British Pound', assetClass: 'forex', currency: 'USD' },
  { symbol: 'USD/JPY', displayName: 'Japanese Yen', assetClass: 'forex', currency: 'JPY' },
  { symbol: 'USD/CHF', displayName: 'Swiss Franc', assetClass: 'forex', currency: 'CHF' },
  { symbol: 'USD/CAD', displayName: 'Canadian Dollar', assetClass: 'forex', currency: 'CAD' }
]

async function main(): Promise<void> {
  await initDb()
  for (const instrument of SEED_INSTRUMENTS) {
    await Database.insert(Schemas.instruments)
      .values({
        symbol: instrument.symbol,
        displayName: instrument.displayName,
        assetClass: instrument.assetClass,
        exchange: 'FOREX',
        currency: instrument.currency,
        provider: 'yahoo'
      })
      .onConflictDoUpdate({
        target: Schemas.instruments.symbol,
        set: {
          displayName: instrument.displayName,
          assetClass: instrument.assetClass,
          currency: instrument.currency,
          provider: 'yahoo'
        }
      })
  }
  console.log(`[seed] upserted ${SEED_INSTRUMENTS.length} forex/metals instruments`)
}

main().catch((error) => {
  console.error('[seed] failed:', error)
  process.exitCode = 1
})
