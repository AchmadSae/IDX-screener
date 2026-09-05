/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { and, count, desc, eq, gte, inArray, lt } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { ApiError } from '@app/server/http/errors.ts'
import { OutcomeEvaluationJob } from '@app/server/jobs/OutcomeEvaluationJob.ts'
import { Prediction } from '@app/server/services/Prediction.ts'
import Utils from '@app/server/Utils.ts'

const VALID_STRATEGIES = ['scalping', 'swing', 'long_term']
const VALID_ASSET_CLASSES = ['stock', 'forex', 'metal']
const VALID_STATUSES = ['open', 'won', 'lost', 'expired']

function validateOptionalEnum(raw: string | undefined, values: string[], param: string): string | undefined {
  if (raw === undefined || raw === '') {
    return undefined
  }
  if (!values.includes(raw)) {
    throw ApiError.badRequest(
      `INVALID_PARAM_${param.toUpperCase()}`,
      `${param} must be one of: ${values.join(', ')} (got "${raw}")`
    )
  }
  return raw
}

/** Jakarta-day boundary (UTC+7) for a yyyymmdd date int. */
function jakartaDayStartUtcMs(dateInt: number): number {
  const year = Math.floor(dateInt / 10000)
  const month = Math.floor((dateInt % 10000) / 100)
  const day = dateInt % 100
  return Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000
}

/**
 * GET /api/predictions — filtered global prediction history with nested
 * outcome rows. Triggers lazy outcome evaluation first.
 */
export async function GET(ctx: Context): Promise<void> {
  const symbol = ctx.query('symbol')?.trim().toUpperCase() || undefined
  const assetClass = validateOptionalEnum(ctx.query('assetClass'), VALID_ASSET_CLASSES, 'assetClass')
  const strategy = validateOptionalEnum(ctx.query('strategy'), VALID_STRATEGIES, 'strategy')
  const status = validateOptionalEnum(ctx.query('status'), VALID_STATUSES, 'status')

  const dateFromRaw = ctx.query('dateFrom')
  const dateToRaw = ctx.query('dateTo')
  const dateFrom = dateFromRaw != null && dateFromRaw !== '' ? Utils.parseDate(dateFromRaw) : null
  const dateTo = dateToRaw != null && dateToRaw !== '' ? Utils.parseDate(dateToRaw) : null
  if ((dateFromRaw != null && dateFromRaw !== '' && dateFrom == null) ||
      (dateToRaw != null && dateToRaw !== '' && dateTo == null)) {
    throw ApiError.badRequest('INVALID_PARAM_DATE', 'dateFrom/dateTo must be yyyymmdd (8 digits)')
  }

  const limitRaw = ctx.query('limit')
  const offsetRaw = ctx.query('offset')
  const { limit, offset } = Utils.parseLimitOffset(limitRaw, offsetRaw, 20, 200)

  await OutcomeEvaluationJob.run()

  const conditions: SQL[] = []
  if (symbol !== undefined) {
    conditions.push(eq(Schemas.predictions.symbol, symbol))
  }
  if (assetClass !== undefined) {
    conditions.push(eq(Schemas.predictions.assetClass, assetClass))
  }
  if (strategy !== undefined) {
    conditions.push(eq(Schemas.predictions.strategy, strategy))
  }
  if (status !== undefined) {
    conditions.push(eq(Schemas.predictions.status, status))
  }
  if (dateFrom != null) {
    conditions.push(gte(Schemas.predictions.createdAt, new Date(jakartaDayStartUtcMs(dateFrom))))
  }
  if (dateTo != null) {
    conditions.push(lt(Schemas.predictions.createdAt, new Date(jakartaDayStartUtcMs(dateTo) + 86_400_000)))
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const rows = await Database.select()
    .from(Schemas.predictions)
    .where(where)
    .orderBy(desc(Schemas.predictions.createdAt))
    .limit(limit)
    .offset(offset)

  const totalCountRows = await Database.select({ total: count() })
    .from(Schemas.predictions)
    .where(where)
  const totalCount = totalCountRows[0]?.total ?? 0

  const ids = rows.map((row) => row.id)
  const outcomes =
    ids.length > 0
      ? await Database.select()
          .from(Schemas.predictionOutcomes)
          .where(inArray(Schemas.predictionOutcomes.predictionId, ids))
      : []
  const outcomeByPredictionId = new Map(
    outcomes.map((outcome) => [outcome.predictionId, outcome])
  )

  ctx.send.json({
    data: rows.map((row) => ({
      ...row,
      outcome: outcomeByPredictionId.get(row.id) ?? null
    })),
    meta: { totalCount, limit, offset }
  })
}

/**
 * POST /api/predictions — creates a rules-v2 prediction (optionally with
 * DeepSeek analysis). AI failures never block the rules result.
 */
export async function POST(ctx: Context): Promise<void> {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const prediction = await Prediction.create({
    symbol: String(body.symbol ?? ''),
    assetClass: body.assetClass as 'stock' | 'forex' | 'metal' | undefined,
    strategy: body.strategy as 'scalping' | 'swing' | 'long_term' | undefined,
    currentPrice: body.currentPrice != null && body.currentPrice !== '' ? Number(body.currentPrice) : undefined,
    useDeepSeek: body.useDeepSeek === true
  })
  ctx.send.json({ data: prediction }, { status: 201 })
}
