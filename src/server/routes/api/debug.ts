import type { Context } from '@neabyte/deserve'
import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import { loadMarketData } from '@app/server/repositories/StockMarketDataRepository.ts'

export async function GET(ctx: Context) {
  const screenerCount = await Database.select({ count: Schemas.screener.code })
    .from(Schemas.screener)
  const summaryDates = await Database.select({ date: Schemas.summary.date })
    .from(Schemas.summary)
    .groupBy(Schemas.summary.date)
  const summaryCount = await Database.select({ count: Schemas.summary.stockCode })
    .from(Schemas.summary)

  const latestDate = summaryDates.length > 0
    ? summaryDates.sort((a, b) => (b.date ?? 0) - (a.date ?? 0))[0]?.date ?? null
    : null

  let bundleInfo: Record<string, unknown> = {}
  if (latestDate != null) {
    try {
      const bundle = await loadMarketData(latestDate as number)
      bundleInfo = {
        summaryDate: bundle.summaryDate,
        screenerRows: bundle.screenerRows.length,
        codesWithLiquidity: bundle.codeToLiquidity.size,
        codesWithTechnical: bundle.codeToTechnical.size,
        sampleScreenerRows: bundle.screenerRows.slice(0, 3).map((r) => ({
          code: r.code,
          name: r.name,
          per: r.per,
          roe: r.roe,
          der: r.der,
          week13PC: r.week13PC
        }))
      }
    } catch (error) {
      bundleInfo = { error: String(error) }
    }
  }

  return ctx.send.json({
    screenerRows: screenerCount.length,
    summaryDates: summaryDates.length,
    summaryRows: summaryCount.length,
    latestSummaryDate: latestDate,
    bundle: bundleInfo
  })
}
