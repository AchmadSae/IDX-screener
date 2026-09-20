/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Express app factory — creates and configures the Express application
 * without starting an HTTP server. Used by both local dev (node.ts) and
 * Vercel serverless (api/index.ts).
 */

import crypto from 'node:crypto'
import express from 'express'
import { createExpressContext } from '@app/server/http/ExpressContext.ts'
import { isApiError } from '@app/server/http/errors.ts'

import * as HealthRoute from '@app/server/routes/api/health.ts'
import * as GeneralRoute from '@app/server/routes/api/general.ts'
import * as CandidatesRoute from '@app/server/routes/api/candidates.ts'
import * as RankedRoute from '@app/server/routes/api/screener/ranked.ts'
import * as ScreenerRsiRoute from '@app/server/routes/api/screener/rsi.ts'
import * as ScreenerBidOfferRoute from '@app/server/routes/api/screener/bid-offer.ts'
import * as SectorStrengthRoute from '@app/server/routes/api/sector/strength.ts'
import * as HistoryBidOfferRoute from '@app/server/routes/api/history/bid-offer.ts'
import * as StockDetailRoute from '@app/server/routes/api/stock/[code]/detail.ts'
import * as OhlcRoute from '@app/server/routes/api/[code]/ohlc.ts'
import * as RsiRoute from '@app/server/routes/api/[code]/rsi.ts'
import * as ForeignRoute from '@app/server/routes/api/[code]/foreign.ts'
import * as BidOfferRoute from '@app/server/routes/api/[code]/bid-offer.ts'
import * as PredictionsRoute from '@app/server/routes/api/predictions.ts'
import * as PredictionsStatsRoute from '@app/server/routes/api/predictions/stats.ts'
import * as InstrumentsRoute from '@app/server/routes/api/instruments.ts'
import * as InstrumentOhlcRoute from '@app/server/routes/api/instruments/[symbol]/ohlc.ts'
import * as AnalysesRoute from '@app/server/routes/api/analyses.ts'
import * as IngestRoute from '@app/server/routes/api/ingest.ts'
import * as DebugRoute from '@app/server/routes/api/debug.ts'

type Context = ReturnType<typeof createExpressContext>

type RouteHandlers = {
  GET?: (ctx: Context) => Promise<unknown> | unknown
  POST?: (ctx: Context) => Promise<unknown> | unknown
}

function mountRoute(app: express.Express, routePath: string, handlers: RouteHandlers): void {
  const wrap = (handler: (ctx: Context) => Promise<unknown> | unknown) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        await handler(createExpressContext(req, res))
      } catch (error) {
        next(error)
      }
    }
  }
  if (handlers.GET != null) {
    app.get(routePath, wrap(handlers.GET))
  }
  if (handlers.POST != null) {
    app.post(routePath, wrap(handlers.POST))
  }
}

export function createApp(): express.Express {
  const app = express()

  app.disable('x-powered-by')
  app.use((_req, res, next) => {
    const requestId = crypto.randomUUID()
    res.locals.requestId = requestId
    res.setHeader('X-Request-Id', requestId)
    next()
  })
  app.use(express.json({ limit: '1mb' }))

  mountRoute(app, '/api/health', { GET: HealthRoute.GET })
  mountRoute(app, '/api/general', { GET: GeneralRoute.GET })
  mountRoute(app, '/api/candidates', { GET: CandidatesRoute.GET })
  mountRoute(app, '/api/screener/ranked', { GET: RankedRoute.GET })
  mountRoute(app, '/api/screener/rsi', { GET: ScreenerRsiRoute.GET })
  mountRoute(app, '/api/screener/bid-offer', { GET: ScreenerBidOfferRoute.GET })
  mountRoute(app, '/api/sector/strength', { GET: SectorStrengthRoute.GET })
  mountRoute(app, '/api/history/bid-offer', { GET: HistoryBidOfferRoute.GET })
  mountRoute(app, '/api/stock/:code/detail', { GET: StockDetailRoute.GET })
  mountRoute(app, '/api/:code/ohlc', { GET: OhlcRoute.GET })
  mountRoute(app, '/api/:code/rsi', { GET: RsiRoute.GET })
  mountRoute(app, '/api/:code/foreign', { GET: ForeignRoute.GET })
  mountRoute(app, '/api/:code/bid-offer', { GET: BidOfferRoute.GET })
  mountRoute(app, '/api/predictions', {
    GET: PredictionsRoute.GET,
    POST: PredictionsRoute.POST
  })
  mountRoute(app, '/api/predictions/stats', { GET: PredictionsStatsRoute.GET })
  mountRoute(app, '/api/instruments', { GET: InstrumentsRoute.GET })
  mountRoute(app, '/api/instruments/:symbol/ohlc', { GET: InstrumentOhlcRoute.GET })
  mountRoute(app, '/api/analyses', {
    GET: AnalysesRoute.GET,
    POST: AnalysesRoute.POST
  })
  mountRoute(app, '/api/ingest', { POST: IngestRoute.POST })
  mountRoute(app, '/api/debug', { GET: DebugRoute.GET })

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const requestId = String(res.locals.requestId ?? '')
    if (isApiError(error)) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          requestId
        }
      })
      return
    }
    console.error('[server] unhandled request error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error',
        requestId
      }
    })
  })

  return app
}
