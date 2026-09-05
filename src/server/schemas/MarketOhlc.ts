import {
  doublePrecision,
  index,
  pgTable,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core'
import { instruments } from '@app/server/schemas/Prediction.ts'

export const marketOhlc = pgTable(
  'market_ohlc',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    instrumentId: uuid('instrument_id').notNull().references(() => instruments.id),
    dateInt: doublePrecision('date_int').notNull(),
    priceOpen: doublePrecision('price_open'),
    priceHigh: doublePrecision('price_high'),
    priceLow: doublePrecision('price_low'),
    priceClose: doublePrecision('price_close').notNull(),
    volume: doublePrecision('volume')
  },
  (table) => [
    uniqueIndex('market_ohlc_instrument_date_uq').on(table.instrumentId, table.dateInt),
    index('market_ohlc_instrument_date_idx').on(table.instrumentId, table.dateInt)
  ]
)
