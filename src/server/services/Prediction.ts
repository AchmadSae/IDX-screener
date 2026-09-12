/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Prediction orchestrator (rules-v2): assembles inputs, runs the pure rules
 * engine, optionally calls DeepSeek (never blocking the rules result), and
 * persists the prediction row.
 */

import { desc, eq } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { ApiError } from '@app/server/http/errors.ts'
import { DeepSeek } from '@app/server/services/DeepSeek.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'
import { assembleRuleInput } from '@app/server/services/prediction/inputs.ts'
import {
  computeRulePrediction,
  type PredictionAssetClass,
  type PredictionStrategy
} from '@app/server/services/prediction/rules.ts'

export type { PredictionAssetClass, PredictionStrategy }

export type CreatePredictionInput = {
  symbol: string
  assetClass?: PredictionAssetClass
  strategy?: PredictionStrategy
  currentPrice?: number
  useDeepSeek?: boolean
}

export type PredictionAiStatus = 'ok' | 'failed' | 'skipped' | 'off'

export type PredictionAiRun = {
  runId: string | null
  status: string
  model: string
  promptVersion: string
  errorMessage: string | null
  tokens: { promptTokens: number; completionTokens: number } | null
  estimatedCostUsd: number | null
}

export type CreatedPrediction = Record<string, unknown> & {
  aiStatus: PredictionAiStatus
  aiRun: PredictionAiRun | null
}

export const SUPPORTED_FOREX_METALS = [
  'XAU/USD',
  'XAG/USD',
  'AUD/USD',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'USD/CAD'
]

export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\s+/g, '')
}

export function parseStrategy(raw: string | undefined): PredictionStrategy {
  if (raw === undefined || raw === '') {
    return 'swing'
  }
  if (
    raw === 'scalping' ||
    raw === 'scalping_hourly' ||
    raw === 'scalping_minutes' ||
    raw === 'swing' ||
    raw === 'long_term'
  ) {
    return raw
  }
  throw ApiError.badRequest(
    'INVALID_PARAM_STRATEGY',
    `strategy must be one of: scalping, scalping_hourly, scalping_minutes, swing, long_term (got "${raw}")`
  )
}

export function parseAssetClass(raw: string | undefined, symbol: string): PredictionAssetClass {
  if (raw === undefined || raw === '') {
    if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) {
      return 'metal'
    }
    if (symbol.includes('/')) {
      return 'forex'
    }
    return 'stock'
  }
  if (raw === 'stock' || raw === 'forex' || raw === 'metal') {
    return raw
  }
  throw ApiError.badRequest(
    'INVALID_PARAM_ASSET_CLASS',
    `assetClass must be one of: stock, forex, metal (got "${raw}")`
  )
}

export class Prediction {
  static async create(input: CreatePredictionInput): Promise<CreatedPrediction> {
    const symbol = normalizeSymbol(input.symbol)
    if (symbol === '') {
      throw ApiError.badRequest('PREDICTION_INPUT_ERROR', 'symbol is required')
    }

    const strategy = parseStrategy(input.strategy)
    const assetClass = parseAssetClass(input.assetClass, symbol)

    if (assetClass !== 'stock' && !(await InstrumentService.isKnown(symbol))) {
      throw ApiError.badRequest(
        'UNKNOWN_INSTRUMENT',
        `unknown instrument "${symbol}". Supported forex/metals: ${SUPPORTED_FOREX_METALS.join(', ')}`
      )
    }

    const assembled = await assembleRuleInput(symbol, assetClass, strategy, input.currentPrice)
    const ruleOutput = computeRulePrediction(assembled.ruleInput)

    const inserted = await Database.insert(Schemas.predictions)
      .values({
        symbol,
        assetClass,
        strategy,
        horizonDays: ruleOutput.horizonDays,
        entryPrice: ruleOutput.entryPrice,
        targetPrice: ruleOutput.targetPrice,
        stopLoss: ruleOutput.stopLoss,
        bullishProbability: ruleOutput.bullishProbability,
        confidenceScore: ruleOutput.confidenceScore,
        ruleScore: ruleOutput.ruleScore,
        riskNotes: ruleOutput.riskNotes,
        modelVersion: 'rules-v2',
        metadata: ruleOutput.metadata
      })
      .returning()
    let row = inserted[0]!

    let aiStatus: PredictionAiStatus = 'off'
    let aiRun: PredictionAiRun | null = null
    if (input.useDeepSeek === true) {
      const result = await DeepSeek.analyze({
        symbol,
        assetClass,
        strategy,
        entryPrice: ruleOutput.entryPrice,
        ruleOutput,
        closes: assembled.closes,
        fundamentals: assembled.ruleInput.fundamentals,
        indicators: assembled.ruleInput.indicators,
        predictionId: row.id
      })
      if (result.status === 'skipped') {
        aiStatus = 'skipped'
      } else if (result.status === 'failed') {
        aiStatus = 'failed'
      } else {
        aiStatus = 'ok'
      }
      aiRun = {
        runId: result.runId,
        status: result.status,
        model: result.model,
        promptVersion: result.promptVersion,
        errorMessage: result.errorMessage,
        tokens: result.tokens,
        estimatedCostUsd: result.estimatedCostUsd
      }
      const updated = await Database.update(Schemas.predictions)
        .set({
          aiScore: result.parsed.bullishProbability,
          aiSummary: result.summary
        })
        .where(eq(Schemas.predictions.id, row.id))
        .returning()
      row = updated[0] ?? row
    }

    return { ...row, aiStatus, aiRun }
  }

  static async history(limit = 50) {
    return await Database.select()
      .from(Schemas.predictions)
      .orderBy(desc(Schemas.predictions.createdAt))
      .limit(Math.min(Math.max(limit, 1), 200))
  }
}

export default Prediction
