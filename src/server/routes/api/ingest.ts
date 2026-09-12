import type { Context } from '@neabyte/deserve'
import * as Services from '@app/server/services/index.ts'
import { clearMarketDataCache } from '@app/server/repositories/StockMarketDataRepository.ts'
import { OutcomeEvaluationJob } from '@app/server/jobs/OutcomeEvaluationJob.ts'

export async function POST(ctx: Context) {
  console.info('[ingest-api] manual ingestion triggered')
  try {
    const client = new Services.Client()
    try {
      await Services.Screener.run(client)
    } catch (error) {
      console.error('[ingest-api] screener failed (non-blocking):', error)
    }
    const today = Services.CronDate.todayDateInt()
    try {
      await Services.Summary.run(client, today)
    } catch (error) {
      console.error(`[ingest-api] summary failed for ${today}:`, error)
    }
    clearMarketDataCache()
    try {
      const settled = await OutcomeEvaluationJob.run()
      if (settled > 0) {
        console.info(`[ingest-api] settled ${settled} prediction(s)`)
      }
    } catch (error) {
      console.error('[ingest-api] outcome evaluation failed (non-blocking):', error)
    }
    console.info('[ingest-api] done')
    return ctx.send.json({ ok: true, summaryDate: today })
  } catch (error) {
    console.error('[ingest-api] ingestion failed:', error)
    return ctx.send.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
