import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb } from '@app/server/Database.ts'
import * as Services from '@app/server/services/index.ts'
import { createExpressContext } from '@app/server/http/ExpressContext.ts'

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
import { Prediction } from '@app/server/services/Prediction.ts'

type GetRouteModule = {
  GET(ctx: ReturnType<typeof createExpressContext>): Promise<unknown> | unknown
}

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const projectRoot = path.resolve(currentDir, '../..')
const distRoot = path.join(projectRoot, 'dist')
const port = Number(process.env['PORT'] ?? 50270)

function mountGet(app: express.Express, routePath: string, routeModule: GetRouteModule): void {
  app.get(routePath, async (req, res, next) => {
    try {
      await routeModule.GET(createExpressContext(req, res))
    } catch (error) {
      next(error)
    }
  })
}

async function runFetchData(): Promise<void> {
  const fetcher = new Services.Fetcher()
  await fetcher.run()
}

async function main(): Promise<void> {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: '1mb' }))
  app.use('/assets', express.static(path.join(distRoot, 'assets'), {
    immutable: true,
    maxAge: '1y'
  }))

  mountGet(app, '/api/health', HealthRoute)
  mountGet(app, '/api/general', GeneralRoute)
  mountGet(app, '/api/candidates', CandidatesRoute)
  mountGet(app, '/api/screener/ranked', RankedRoute)
  mountGet(app, '/api/screener/rsi', ScreenerRsiRoute)
  mountGet(app, '/api/screener/bid-offer', ScreenerBidOfferRoute)
  mountGet(app, '/api/sector/strength', SectorStrengthRoute)
  mountGet(app, '/api/history/bid-offer', HistoryBidOfferRoute)
  mountGet(app, '/api/stock/:code/detail', StockDetailRoute)
  mountGet(app, '/api/:code/ohlc', OhlcRoute)
  mountGet(app, '/api/:code/rsi', RsiRoute)
  mountGet(app, '/api/:code/foreign', ForeignRoute)
  mountGet(app, '/api/:code/bid-offer', BidOfferRoute)

  app.get('/api/predictions', async (req, res, next) => {
    try {
      const limit = typeof req.query['limit'] === 'string' ? Number(req.query['limit']) : 50
      res.json({
        data: await Prediction.history(Number.isFinite(limit) ? limit : 50)
      })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/predictions', async (req, res, next) => {
    try {
      const prediction = await Prediction.create({
        symbol: String(req.body?.symbol ?? ''),
        assetClass: req.body?.assetClass,
        strategy: req.body?.strategy,
        currentPrice: req.body?.currentPrice != null ? Number(req.body.currentPrice) : undefined,
        useDeepSeek: req.body?.useDeepSeek === true
      })
      res.status(201).json({ data: prediction })
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: {
            code: 'PREDICTION_INPUT_ERROR',
            message: error.message
          }
        })
        return
      }
      next(error)
    }
  })

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    res.sendFile(path.join(distRoot, 'index.html'))
  })

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server] unhandled request error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error'
      }
    })
  })

  await initDb()

  if (process.env['ENABLE_INGESTION_CRON'] === 'true') {
    setInterval(() => {
      runFetchData().catch((error) => {
        console.error('[cron] Fetch IDX data failed:', error)
      })
    }, 60 * 60 * 1000)
  }

  app.listen(port, () => {
    console.info(`[server] Express monolith listening on http://127.0.0.1:${port}`)
  })
}

main().catch((error) => {
  console.error('[server] failed to start:', error)
  process.exitCode = 1
})
