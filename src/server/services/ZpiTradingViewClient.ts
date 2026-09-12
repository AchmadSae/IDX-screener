/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Thin client for ZPI's TradingView API. Provides screener, quotes,
 * technicals, chart candles, performance, financials, news, search,
 * and economic calendar across 16+ markets including Indonesia and Forex.
 *
 * @see https://zpi.web.id/api/finance/tradingview
 */

const ZPI_TV_BASE_URL = 'https://api.zpi.web.id/v1/finance:tradingview'
const REQUEST_TIMEOUT_MS = 15_000

// ─── Options ────────────────────────────────────────────────────────────────

export type ZpiTvFetchOptions = {
  fetchImpl?: typeof fetch
  apiKey?: string
}

// ─── Market enum ────────────────────────────────────────────────────────────

export type TvMarket =
  | 'indonesia'
  | 'america'
  | 'crypto'
  | 'forex'
  | 'malaysia'
  | 'singapore'
  | 'thailand'
  | 'japan'
  | 'hongkong'
  | 'india'
  | 'uk'
  | 'germany'
  | 'australia'
  | 'futures'
  | 'cfd'
  | 'bond'

// ─── Screener ───────────────────────────────────────────────────────────────

export type ApiEnvelope<T> = {
  content: T
  message: string | null
  errors: string[] | null
}

// ─── Screener ───────────────────────────────────────────────────────

export type ScreenerParams = {
  market?: TvMarket
  search?: string
  columns?: string
  sortBy?: string
  sortOrder?: 'desc' | 'asc'
  page?: number
  count?: number
}

export type ScreenerItem = {
  last: number
  name: string
  change: number
  sector: string
  symbol: string
  ticker: string
  volume: number
  peRatio: number | null
  exchange: string
  marketCap: number
  changePercent: number
}

export type ScreenerResponse = {
  page: number
  count: number
  items: ScreenerItem[]
  query: string
  total: number
  market: string
  hasMore: boolean
  nextPage: number | null
}

// ─── Symbol ─────────────────────────────────────────────────────────────────

export type SymbolParams = {
  symbol: string
  market?: TvMarket
}

export type SymbolResponse = {
  eps: number | null
  low: number
  debt: number | null
  high: number
  last: number
  name: string
  open: number
  change: number
  market: string
  sector: string
  symbol: string
  ticker: string
  volume: number
  peRatio: number | null
  revenue: number | null
  currency: string
  exchange: string
  industry: string
  monthLow: number | null
  provider: string
  marketCap: number
  monthHigh: number | null
  week52Low: number | null
  week52High: number | null
  priceToBook: number | null
  avgVolume10d: number | null
  changePercent: number
  dividendYieldPercent: number | null
}

// ─── Markets ────────────────────────────────────────────────────────────────

export type MarketsParams = {
  search?: string
  scope?: 'default' | 'all'
}

export type MarketsItem = {
  id: string
  label: string
  instrumentCount: number
}

export type MarketsResponse = {
  count: number
  items: MarketsItem[]
  provider: string
}

// ─── Chart ──────────────────────────────────────────────────────────────────

export type ChartResolution =
  | '1' | '3' | '5' | '15' | '30' | '45'
  | '60' | '120' | '180' | '240'
  | '1D' | '1W' | '1M' | '3M' | '6M' | '12M'

export type ChartParams = {
  symbol: string
  market?: TvMarket
  resolution?: ChartResolution
  count?: number
}

export type Candle = {
  low: number
  date: string
  high: number
  open: number
  close: number
  volume: number
  timestamp: number
}

export type ChartResponse = {
  name: string
  count: number
  market: string
  symbol: string
  candles: Candle[]
  currency: string
  exchange: string
  provider: string
  timezone: string
  resolution: string
}

// ─── Technicals ─────────────────────────────────────────────────────────────

export type TechnicalTimeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1w' | '1M'

export type TechnicalsParams = {
  symbol: string
  market?: TvMarket
  timeframe?: TechnicalTimeframe
  columns?: string
}

export type TechnicalsResponse = {
  adx: number | null
  atr: number | null
  rsi: number | null
  last: number
  macd: number | null
  vwma: number | null
  cci20: number | null
  ema10: number | null
  ema20: number | null
  ema50: number | null
  sma10: number | null
  sma20: number | null
  sma50: number | null
  ema100: number | null
  ema200: number | null
  market: string
  sma100: number | null
  sma200: number | null
  stochD: number | null
  stochK: number | null
  symbol: string
  ticker: string
  summary: string
  momentum: number | null
  provider: string
  ratingAll: number | null
  timeframe: string
  williamsR: number | null
  macdSignal: number | null
  bollingerLower: number | null
  bollingerUpper: number | null
  pivotClassicR1: number | null
  pivotClassicS1: number | null
  awesomeOscillator: number | null
  ratingOscillators: number | null
  oscillatorsSummary: string
  pivotClassicMiddle: number | null
  ratingMovingAverages: number | null
  movingAveragesSummary: string
}

// ─── Performance ────────────────────────────────────────────────────────────

export type PerformanceParams = {
  symbol: string
  market?: TvMarket
}

export type PerformanceResponse = {
  last: number
  name: string
  market: string
  symbol: string
  ticker: string
  currency: string
  exchange: string
  provider: string
  beta1Year: number | null
  week52Low: number | null
  gapPercent: number | null
  week52High: number | null
  ytdPercent: number | null
  avgVolume10d: number | null
  avgVolume30d: number | null
  week1Percent: number | null
  year1Percent: number | null
  year5Percent: number | null
  month1Percent: number | null
  month3Percent: number | null
  month6Percent: number | null
  allTimePercent: number | null
  relativeVolume10d: number | null
  volatilityDayPercent: number | null
  volatilityWeekPercent: number | null
  volatilityMonthPercent: number | null
}

// ─── Financials ─────────────────────────────────────────────────────────────

export type FinancialsPeriod = 'quarter' | 'annual' | 'ttm'

export type FinancialsParams = {
  symbol: string
  market?: TvMarket
  period?: FinancialsPeriod
}

export type FinancialsResponse = {
  name: string
  market: string
  period: string
  symbol: string
  ticker: string
  revenue: number | null
  currency: string
  provider: string
  employees: number | null
  netIncome: number | null
  totalDebt: number | null
  totalAssets: number | null
  totalEquity: number | null
  currentRatio: number | null
  debtToEquity: number | null
  freeCashFlow: number | null
  operatingIncome: number | null
  lastEarningsDate: number | null
  nextEarningsDate: number | null
  totalLiabilities: number | null
  dividendYieldPercent: number | null
  returnOnAssetsPercent: number | null
  returnOnEquityPercent: number | null
  epsForecastNextQuarter: number | null
  dividendPayoutRatioPercent: number | null
}

// ─── News ───────────────────────────────────────────────────────────────────

export type NewsParams = {
  symbol: string
  market?: TvMarket
  lang?: 'en' | 'id'
  count?: number
}

export type NewsItem = {
  id: string
  url: string
  title: string
  source: string
  urgency: number
  publishedAt: number
  headlineOnly: boolean
  publishedAtIso: string
  relatedSymbols: string[]
}

export type NewsResponse = {
  lang: string
  count: number
  items: NewsItem[]
  symbol: string
  provider: string
}

// ─── Search ─────────────────────────────────────────────────────────────────

export type SearchParams = {
  q: string
  exchange?: string
  type?: 'all' | 'stock' | 'futures' | 'forex' | 'index' | 'crypto' | 'bond' | 'economic' | 'fund'
  page?: number
  count?: number
}

export type SearchItem = {
  isin: string | null
  name: string
  type: string
  symbol: string
  ticker: string
  country: string
  subType: string
  currency: string
  exchange: string
}

export type SearchResponse = {
  count: number
  items: SearchItem[]
  query: string
  provider: string
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export type CalendarParams = {
  countries?: string
  from?: string
  to?: string
  importance?: 'all' | 'high' | 'medium' | 'low'
}

export type CalendarItem = {
  id: string
  date: string
  title: string
  period: string
  source: string
  country: string
  currency: string
  previous: number | null
  indicator: string
  importance: string
  description: string
  unit?: string
  forecast?: number | null
}

export type CalendarResponse = {
  to: string
  from: string
  count: number
  items: CalendarItem[]
  provider: string
  countries: string[]
}

// ─── Quote ──────────────────────────────────────────────────────────────────

export type QuoteScope = 'core' | 'full' | 'all'

export type QuoteParams = {
  symbol: string
  market?: TvMarket
  scope?: QuoteScope
}

export type QuoteResponse = {
  ask: number | null
  bid: number | null
  ceo: string | null
  eps: number | null
  low: number
  high: number
  last: number
  name: string
  open: number
  type: string
  change: number
  lastAt: number | null
  market: string
  minMov: number | null
  sector: string
  symbol: string
  ticker: string
  volume: number
  askSize: number | null
  bidSize: number | null
  country: string | null
  founded: number | null
  peRatio: number | null
  proName: string
  session: string
  website: string | null
  currency: string
  exchange: string
  industry: string
  provider: string
  timezone: string
  avgVolume: number | null
  employees: number | null
  lastAtIso: string | null
  marketCap: number
  week52Low: number | null
  allTimeLow: number | null
  fractional: boolean
  isTradable: boolean
  priceScale: number | null
  updateMode: string
  week52High: number | null
  allTimeHigh: number | null
  floatShares: number | null
  changePercent: number | null
  previousClose: number | null
  listedExchange: string
  sharesOutstanding: number | null
  businessDescription: string | null
  dividendYieldPercent: number | null
}

// ─── Client ─────────────────────────────────────────────────────────────────

export class ZpiTradingViewClient {
  private readonly apiKey: string | undefined
  private readonly fetchImpl: typeof fetch

  constructor(options: ZpiTvFetchOptions = {}) {
    const apiKey = options.apiKey ?? process.env['ZPI_API_KEY']
    this.apiKey = apiKey != null && apiKey.trim() !== '' ? apiKey.trim() : undefined
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  isConfigured(): boolean {
    return this.apiKey != null
  }

  // ─── URL builders ───────────────────────────────────────────────────────

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${ZPI_TV_BASE_URL}/${endpoint}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.toString()
  }

  screenerUrl(params?: ScreenerParams): string {
    return this.buildUrl('screener', {
      market: params?.market,
      search: params?.search,
      columns: params?.columns,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      page: params?.page,
      count: params?.count
    })
  }

  symbolUrl(params: SymbolParams): string {
    return this.buildUrl('symbol', {
      symbol: params.symbol,
      market: params.market
    })
  }

  marketsUrl(params?: MarketsParams): string {
    return this.buildUrl('markets', {
      search: params?.search,
      scope: params?.scope
    })
  }

  chartUrl(params: ChartParams): string {
    return this.buildUrl('chart', {
      symbol: params.symbol,
      market: params.market,
      resolution: params.resolution,
      count: params.count
    })
  }

  technicalsUrl(params: TechnicalsParams): string {
    return this.buildUrl('technicals', {
      symbol: params.symbol,
      market: params.market,
      timeframe: params.timeframe,
      columns: params.columns
    })
  }

  performanceUrl(params: PerformanceParams): string {
    return this.buildUrl('performance', {
      symbol: params.symbol,
      market: params.market
    })
  }

  financialsUrl(params: FinancialsParams): string {
    return this.buildUrl('financials', {
      symbol: params.symbol,
      market: params.market,
      period: params.period
    })
  }

  newsUrl(params: NewsParams): string {
    return this.buildUrl('news', {
      symbol: params.symbol,
      market: params.market,
      lang: params.lang,
      count: params.count
    })
  }

  searchUrl(params: SearchParams): string {
    return this.buildUrl('search', {
      q: params.q,
      exchange: params.exchange,
      type: params.type,
      page: params.page,
      count: params.count
    })
  }

  calendarUrl(params?: CalendarParams): string {
    return this.buildUrl('calendar', {
      countries: params?.countries,
      from: params?.from,
      to: params?.to,
      importance: params?.importance
    })
  }

  quoteUrl(params: QuoteParams): string {
    return this.buildUrl('quote', {
      symbol: params.symbol,
      market: params.market,
      scope: params.scope
    })
  }

  // ─── Fetch helpers ──────────────────────────────────────────────────────

  private async requestInit(): Promise<{ headers: Record<string, string>; signal: AbortSignal }> {
    if (this.apiKey == null) {
      throw new Error('ZPI_API_KEY is not configured')
    }
    return {
      headers: {
        Accept: 'application/json',
        'x-api-key': this.apiKey
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    }
  }

  private async request<T>(url: string): Promise<T> {
    const init = await this.requestInit()
    const response = await this.fetchImpl(url, init)
    if (!response.ok) {
      throw new Error(`ZPI TradingView API ${response.status}: ${response.statusText}`)
    }
    const raw = await response.json() as Record<string, unknown>
    const inner = raw['data'] as T | undefined
    return inner ?? (raw as unknown as T)
  }

  // ─── Data fetchers ──────────────────────────────────────────────────────

  async fetchScreener(params?: ScreenerParams): Promise<ScreenerResponse> {
    return this.request<ScreenerResponse>(this.screenerUrl(params))
  }

  async fetchSymbol(params: SymbolParams): Promise<SymbolResponse> {
    return this.request<SymbolResponse>(this.symbolUrl(params))
  }

  async fetchMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    return this.request<MarketsResponse>(this.marketsUrl(params))
  }

  async fetchChart(params: ChartParams): Promise<ChartResponse> {
    return this.request<ChartResponse>(this.chartUrl(params))
  }

  async fetchTechnicals(params: TechnicalsParams): Promise<TechnicalsResponse> {
    return this.request<TechnicalsResponse>(this.technicalsUrl(params))
  }

  async fetchPerformance(params: PerformanceParams): Promise<PerformanceResponse> {
    return this.request<PerformanceResponse>(this.performanceUrl(params))
  }

  async fetchFinancials(params: FinancialsParams): Promise<FinancialsResponse> {
    return this.request<FinancialsResponse>(this.financialsUrl(params))
  }

  async fetchNews(params: NewsParams): Promise<NewsResponse> {
    return this.request<NewsResponse>(this.newsUrl(params))
  }

  async fetchSearch(params: SearchParams): Promise<SearchResponse> {
    return this.request<SearchResponse>(this.searchUrl(params))
  }

  async fetchCalendar(params?: CalendarParams): Promise<CalendarResponse> {
    return this.request<CalendarResponse>(this.calendarUrl(params))
  }

  async fetchQuote(params: QuoteParams): Promise<QuoteResponse> {
    return this.request<QuoteResponse>(this.quoteUrl(params))
  }
}
