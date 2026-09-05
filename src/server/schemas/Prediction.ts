import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

export const instruments = pgTable('instruments', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull().unique(),
  displayName: text('display_name').notNull(),
  assetClass: text('asset_class').notNull(),
  exchange: text('exchange'),
  currency: text('currency'),
  provider: text('provider'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const predictions = pgTable(
  'predictions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    symbol: text('symbol').notNull(),
    assetClass: text('asset_class').notNull(),
    strategy: text('strategy').notNull(),
    horizonDays: integer('horizon_days').notNull(),
    entryPrice: doublePrecision('entry_price').notNull(),
    targetPrice: doublePrecision('target_price').notNull(),
    stopLoss: doublePrecision('stop_loss').notNull(),
    bullishProbability: doublePrecision('bullish_probability').notNull(),
    confidenceScore: doublePrecision('confidence_score').notNull(),
    ruleScore: doublePrecision('rule_score').notNull(),
    aiScore: doublePrecision('ai_score'),
    aiSummary: text('ai_summary'),
    riskNotes: jsonb('risk_notes').$type<string[]>().default([]).notNull(),
    status: text('status').default('open').notNull(),
    modelVersion: text('model_version').default('rules-v1').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('predictions_created_at_idx').on(table.createdAt),
    index('predictions_status_idx').on(table.status)
  ]
)

export const predictionOutcomes = pgTable('prediction_outcomes', {
  id: uuid('id').defaultRandom().primaryKey(),
  predictionId: uuid('prediction_id').notNull().references(() => predictions.id),
  evaluatedAt: timestamp('evaluated_at', { withTimezone: true }).defaultNow().notNull(),
  referencePrice: doublePrecision('reference_price').notNull(),
  returnPercent: doublePrecision('return_percent').notNull(),
  maxFavorableExcursion: doublePrecision('max_favorable_excursion'),
  maxAdverseExcursion: doublePrecision('max_adverse_excursion'),
  hitTarget: text('hit_target').notNull(),
  hitStop: text('hit_stop').notNull()
})

export const aiAnalysisRuns = pgTable(
  'ai_analysis_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    predictionId: uuid('prediction_id').references(() => predictions.id),
    symbol: text('symbol').notNull(),
    assetClass: text('asset_class').notNull(),
    strategy: text('strategy').notNull(),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    status: text('status').notNull(),
    inputHash: text('input_hash'),
    responseSummary: text('response_summary'),
    errorMessage: text('error_message'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('ai_analysis_runs_input_hash_idx').on(table.inputHash)]
)
