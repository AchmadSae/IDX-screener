import { describe, expect, it, vi } from 'vitest'
import { ZpiIdxClient } from './ZpiIdxClient.ts'

describe('ZpiIdxClient', () => {
  // ─── Constructor & configuration ────────────────────────────────────────

  it('trims whitespace from the API key', () => {
    const client = new ZpiIdxClient({ apiKey: '  zpi_secret  ' })
    expect(client.isConfigured()).toBe(true)
  })

  it('reports not configured when no key is provided', () => {
    const client = new ZpiIdxClient({ apiKey: '' })
    expect(client.isConfigured()).toBe(false)
  })

  it('reports not configured when key is undefined', () => {
    const client = new ZpiIdxClient({})
    expect(client.isConfigured()).toBe(false)
  })

  // ─── Stock summary ─────────────────────────────────────────────────────

  it('builds a stock summary URL for full-market historical ingestion', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.stockSummaryUrl(20260905))

    expect(url.origin).toBe('https://api.zpi.web.id')
    expect(url.pathname).toBe('/v1/finance:idx/stock-summary')
    expect(url.searchParams.get('length')).toBe('5000')
    expect(url.searchParams.get('start')).toBe('0')
    expect(url.searchParams.get('date')).toBe('20260905')
  })

  it('builds a stock summary URL with code filter', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.stockSummaryUrl(20260905, { code: 'BBCA' }))

    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('date')).toBe('20260905')
  })

  it('builds a stock summary URL with custom pagination', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.stockSummaryUrl(20260905, { length: 100, start: 200 }))

    expect(url.searchParams.get('length')).toBe('100')
    expect(url.searchParams.get('start')).toBe('200')
  })

  // ─── Index summary ─────────────────────────────────────────────────────

  it('builds an index summary URL', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.indexSummaryUrl({ date: '20260905' }))

    expect(url.pathname).toBe('/v1/finance:idx/index-summary')
    expect(url.searchParams.get('date')).toBe('20260905')
  })

  // ─── Top movers ────────────────────────────────────────────────────────

  it('builds a top movers URL with type and resultCount', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.topMoversUrl({ type: 'gainer', resultCount: 10 }))

    expect(url.pathname).toBe('/v1/finance:idx/top-movers')
    expect(url.searchParams.get('type')).toBe('gainer')
    expect(url.searchParams.get('resultCount')).toBe('10')
  })

  it('builds a top movers URL with only type', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.topMoversUrl({ type: 'loser' }))

    expect(url.searchParams.get('type')).toBe('loser')
    expect(url.searchParams.get('resultCount')).toBeNull()
  })

  // ─── Broker summary ────────────────────────────────────────────────────

  it('builds a broker summary URL', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.brokerSummaryUrl({ date: '20260905', length: 50 }))

    expect(url.pathname).toBe('/v1/finance:idx/broker-summary')
    expect(url.searchParams.get('date')).toBe('20260905')
    expect(url.searchParams.get('length')).toBe('50')
  })

  // ─── Companies ─────────────────────────────────────────────────────────

  it('builds a companies URL with code filter', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.companiesUrl({ code: 'BBCA' }))

    expect(url.pathname).toBe('/v1/finance:idx/companies')
    expect(url.searchParams.get('code')).toBe('BBCA')
  })

  // ─── Securities ────────────────────────────────────────────────────────

  it('builds a securities URL with all filters', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.securitiesUrl({ code: 'BBCA', sector: 'Financials', board: 'Utama' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/securities')
    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('sector')).toBe('Financials')
    expect(url.searchParams.get('board')).toBe('Utama')
  })

  // ─── Financial report ──────────────────────────────────────────────────

  it('builds a financial report URL with required year', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.financialReportUrl({ year: 2024, period: 'audit', code: 'BBCA' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/financial-report')
    expect(url.searchParams.get('year')).toBe('2024')
    expect(url.searchParams.get('period')).toBe('audit')
    expect(url.searchParams.get('code')).toBe('BBCA')
  })

  // ─── Market activity ───────────────────────────────────────────────────

  it('builds a market activity URL with type', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.marketActivityUrl({ type: 'uma' }))

    expect(url.pathname).toBe('/v1/finance:idx/market-activity')
    expect(url.searchParams.get('type')).toBe('uma')
  })

  // ─── News ──────────────────────────────────────────────────────────────

  it('builds a news URL with keyword and date range', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.newsUrl({
        keyword: 'dividen',
        dateFrom: '20260101',
        dateTo: '20260613',
        locale: 'id'
      })
    )

    expect(url.pathname).toBe('/v1/finance:idx/news')
    expect(url.searchParams.get('keyword')).toBe('dividen')
    expect(url.searchParams.get('dateFrom')).toBe('20260101')
    expect(url.searchParams.get('dateTo')).toBe('20260613')
    expect(url.searchParams.get('locale')).toBe('id')
  })

  // ─── Sitemap ───────────────────────────────────────────────────────────

  it('builds a sitemap URL with locale and section', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.sitemapUrl({ locale: 'id', section: 'data-pasar' }))

    expect(url.pathname).toBe('/v1/finance:idx/sitemap')
    expect(url.searchParams.get('locale')).toBe('id')
    expect(url.searchParams.get('section')).toBe('data-pasar')
  })

  // ─── Raw passthrough ───────────────────────────────────────────────────

  it('builds a raw passthrough URL with path and query', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.rawUrl({
        path: 'TradingSummary/GetStockSummary',
        query: 'length=10&start=0'
      })
    )

    expect(url.pathname).toBe('/v1/finance:idx/raw')
    expect(url.searchParams.get('path')).toBe('TradingSummary/GetStockSummary')
    expect(url.searchParams.get('query')).toBe('length=10&start=0')
  })

  // ─── Announcements ─────────────────────────────────────────────────────

  it('builds an announcements URL with page-based pagination', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.announcementsUrl({ page: 1, length: 20, locale: 'id' }))

    expect(url.pathname).toBe('/v1/finance:idx/announcements')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('length')).toBe('20')
    expect(url.searchParams.get('locale')).toBe('id')
  })

  // ─── Company announcements ─────────────────────────────────────────────

  it('builds a company announcements URL with code', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.companyAnnouncementsUrl({ code: 'BBCA', length: 20, start: 0 })
    )

    expect(url.pathname).toBe('/v1/finance:idx/company-announcements')
    expect(url.searchParams.get('code')).toBe('BBCA')
  })

  // ─── Foreign flow ──────────────────────────────────────────────────────

  it('builds a foreign flow URL with sort and date', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.foreignFlowUrl({ date: '2026-07-31', code: 'BBCA', sort: 'net' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/foreign-flow')
    expect(url.searchParams.get('date')).toBe('2026-07-31')
    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('sort')).toBe('net')
  })

  // ─── Margin summary ────────────────────────────────────────────────────

  it('builds a margin summary URL', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.marginSummaryUrl({ date: '2026-07-14' }))

    expect(url.pathname).toBe('/v1/finance:idx/margin-summary')
    expect(url.searchParams.get('date')).toBe('2026-07-14')
  })

  // ─── Ownership files ───────────────────────────────────────────────────

  it('builds an ownership files URL with category', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.ownershipFilesUrl({ category: 'lima-persen' }))

    expect(url.pathname).toBe('/v1/finance:idx/ownership-files')
    expect(url.searchParams.get('category')).toBe('lima-persen')
  })

  // ─── Brokers ───────────────────────────────────────────────────────────

  it('builds a brokers URL with code', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.brokersUrl({ code: 'YU', view: 'list' }))

    expect(url.pathname).toBe('/v1/finance:idx/brokers')
    expect(url.searchParams.get('code')).toBe('YU')
    expect(url.searchParams.get('view')).toBe('list')
  })

  // ─── Stock history ─────────────────────────────────────────────────────

  it('builds a stock history URL with date range', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.stockHistoryUrl({ code: 'BBCA', from: '2026-07-01', to: '2026-08-08' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/stock-history')
    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('from')).toBe('2026-07-01')
    expect(url.searchParams.get('to')).toBe('2026-08-08')
  })

  it('builds a stock history URL with length', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.stockHistoryUrl({ code: 'BBCA', length: 30 }))

    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('length')).toBe('30')
  })

  // ─── Company profile ───────────────────────────────────────────────────

  it('builds a company profile URL', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.companyProfileUrl('BBCA'))

    expect(url.pathname).toBe('/v1/finance:idx/company-profile')
    expect(url.searchParams.get('code')).toBe('BBCA')
  })

  // ─── Trading info daily ────────────────────────────────────────────────

  it('builds a trading info daily URL', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.tradingInfoDailyUrl('BBCA'))

    expect(url.pathname).toBe('/v1/finance:idx/trading-info-daily')
    expect(url.searchParams.get('code')).toBe('BBCA')
  })

  // ─── Calendar ──────────────────────────────────────────────────────────

  it('builds a calendar URL with date and range', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.calendarUrl({ date: '2026-08-08', range: 'm' }))

    expect(url.pathname).toBe('/v1/finance:idx/calendar')
    expect(url.searchParams.get('date')).toBe('2026-08-08')
    expect(url.searchParams.get('range')).toBe('m')
  })

  // ─── IPO ───────────────────────────────────────────────────────────────

  it('builds an IPO URL with year', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.ipoUrl({ year: 2026 }))

    expect(url.pathname).toBe('/v1/finance:idx/ipo')
    expect(url.searchParams.get('year')).toBe('2026')
  })

  // ─── Lendable stock ────────────────────────────────────────────────────

  it('builds a lendable stock URL with code and view', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.lendableStockUrl({ code: 'BBCA', view: 'full' }))

    expect(url.pathname).toBe('/v1/finance:idx/lendable-stock')
    expect(url.searchParams.get('code')).toBe('BBCA')
    expect(url.searchParams.get('view')).toBe('full')
  })

  // ─── UMA ───────────────────────────────────────────────────────────────

  it('builds a UMA URL with keyword and date range', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.umaUrl({ page: 1, keyword: 'FUTR', dateFrom: '20260101', dateTo: '20260812' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/uma')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('keyword')).toBe('FUTR')
    expect(url.searchParams.get('dateFrom')).toBe('20260101')
    expect(url.searchParams.get('dateTo')).toBe('20260812')
  })

  // ─── Derivatives ───────────────────────────────────────────────────────

  it('builds a derivatives URL with code and underlying', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.derivativesUrl({ code: 'BBCAN6', underlying: 'BBCA', sort: 'volume' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/derivatives')
    expect(url.searchParams.get('code')).toBe('BBCAN6')
    expect(url.searchParams.get('underlying')).toBe('BBCA')
    expect(url.searchParams.get('sort')).toBe('volume')
  })

  // ─── Index constituent ─────────────────────────────────────────────────

  it('builds an index constituent URL with code and group', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(client.indexConstituentUrl({ code: 'LQ45', group: 'all' }))

    expect(url.pathname).toBe('/v1/finance:idx/index-constituent')
    expect(url.searchParams.get('code')).toBe('LQ45')
    expect(url.searchParams.get('group')).toBe('all')
  })

  // ─── Suspension ────────────────────────────────────────────────────────

  it('builds a suspension URL with date range', () => {
    const client = new ZpiIdxClient({ apiKey: 'zpi_test' })
    const url = new URL(
      client.suspensionUrl({ page: 1, keyword: 'SPT', dateFrom: '20260101' })
    )

    expect(url.pathname).toBe('/v1/finance:idx/suspension')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('keyword')).toBe('SPT')
    expect(url.searchParams.get('dateFrom')).toBe('20260101')
  })

  // ─── Auth header ───────────────────────────────────────────────────────

  it('sends the ZPI API key through x-api-key', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ data: [] })))
    const client = new ZpiIdxClient({ apiKey: ' zpi_secret ', fetchImpl })

    await client.fetchStockSummary(20260905)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [, init] = fetchImpl.mock.calls[0]!
    expect((init?.headers as Record<string, string>)['x-api-key']).toBe('zpi_secret')
  })

  it('reports missing configuration before making a network request', async () => {
    const fetchImpl = vi.fn()
    const client = new ZpiIdxClient({ apiKey: '', fetchImpl })

    await expect(client.fetchStockSummary(20260905)).rejects.toThrow(
      'ZPI_API_KEY is not configured'
    )
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('returns non-2xx response without throwing', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response('error', { status: 500 }))
    const client = new ZpiIdxClient({ apiKey: 'zpi_test', fetchImpl })

    const response = await client.fetchStockSummary(20260905)
    expect(response.ok).toBe(false)
    expect(response.status).toBe(500)
  })

  it('passes abort signal for timeout', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ data: [] })))
    const client = new ZpiIdxClient({ apiKey: 'zpi_test', fetchImpl })

    await client.fetchStockSummary(20260905)

    const [, init] = fetchImpl.mock.calls[0]!
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('sets Accept header to application/json', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ data: [] })))
    const client = new ZpiIdxClient({ apiKey: 'zpi_test', fetchImpl })

    await client.fetchStockSummary(20260905)

    const [, init] = fetchImpl.mock.calls[0]!
    expect((init?.headers as Record<string, string>)['Accept']).toBe('application/json')
  })
})
