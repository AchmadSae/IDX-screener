/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Thin client for ZPI's IDX API. The app keeps the legacy IDX fetch path as a
 * fallback when no ZPI key is configured, but production ingestion should set
 * ZPI_API_KEY for cached, normalized IDX data.
 *
 * @see https://zpi.web.id/api/finance/idx
 */

const ZPI_IDX_BASE_URL = 'https://api.zpi.web.id/v1/finance:idx'
const REQUEST_TIMEOUT_MS = 15_000

// ─── Options ────────────────────────────────────────────────────────────────

export type ZpiFetchOptions = {
  fetchImpl?: typeof fetch
  apiKey?: string
}

// ─── Shared parameter types ─────────────────────────────────────────────────

export type PaginationParams = {
  length?: number
  start?: number
}

export type DateParam = {
  date?: string
}

// ─── Endpoint-specific parameter types ──────────────────────────────────────

export type StockSummaryParams = PaginationParams &
  DateParam & {
    code?: string
  }

export type IndexSummaryParams = PaginationParams & DateParam

export type TopMoversType = 'gainer' | 'loser' | 'volume' | 'value' | 'frequent'

export type TopMoversParams = {
  type: TopMoversType
  resultCount?: number
}

export type BrokerSummaryParams = PaginationParams & DateParam

export type CompaniesParams = PaginationParams & {
  code?: string
}

export type SecuritiesParams = PaginationParams & {
  code?: string
  sector?: string
  board?: string
}

export type FinancialReportPeriod = 'tw1' | 'tw2' | 'tw3' | 'audit'

export type FinancialReportParams = PaginationParams & {
  year: number
  period?: FinancialReportPeriod
  code?: string
}

export type MarketActivityType = 'suspend' | 'relisting' | 'uma'

export type MarketActivityParams = {
  type: MarketActivityType
}

export type NewsLocale = 'id' | 'en'

export type NewsParams = PaginationParams & {
  keyword?: string
  dateFrom?: string
  dateTo?: string
  locale?: NewsLocale
}

export type SitemapLocale = 'id' | 'en' | 'all'

export type SitemapParams = {
  locale?: SitemapLocale
  section?: string
}

export type RawParams = {
  path: string
  query?: string
}

export type AnnouncementsLocale = 'id' | 'en'

export type AnnouncementsParams = {
  page?: number
  length?: number
  locale?: AnnouncementsLocale
}

export type CompanyAnnouncementsParams = PaginationParams & {
  code: string
  locale?: AnnouncementsLocale
}

export type ForeignFlowSort = 'net' | 'buy' | 'sell' | 'code'

export type ForeignFlowParams = PaginationParams & DateParam & {
  code?: string
  sort?: ForeignFlowSort
}

export type MarginSummaryParams = PaginationParams & DateParam

export type OwnershipCategory = 'lima-persen' | 'satu-persen' | 'klasifikasi' | 'tipe'

export type OwnershipFilesParams = PaginationParams & {
  category?: OwnershipCategory
}

export type BrokersView = 'list' | 'full'

export type BrokersParams = {
  code?: string
  view?: BrokersView
}

export type StockHistoryParams = {
  code: string
  from?: string
  to?: string
  length?: number
}

export type CalendarRange = 'm' | 'd'

export type CalendarParams = {
  date?: string
  range?: CalendarRange
}

export type IPOParams = PaginationParams & {
  year?: number
}

export type LendableView = 'list' | 'full'

export type LendableStockParams = {
  code?: string
  sort?: 'volume' | 'code'
  view?: LendableView
}

export type UMAPaginationParams = {
  page?: number
  length?: number
}

export type UMAParams = UMAPaginationParams & {
  keyword?: string
  dateFrom?: string
  dateTo?: string
}

export type DerivativesParams = {
  code?: string
  underlying?: string
  sort?: 'volume' | 'openInterest' | 'code'
}

export type IndexConstituentGroup = 'all' | 'main' | 'sector'

export type IndexConstituentParams = {
  code?: string
  group?: IndexConstituentGroup
}

export type SuspensionParams = UMAPaginationParams & {
  keyword?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

// ─── Response types ─────────────────────────────────────────────────────────

export type ZpiResponse<T> = {
  data: T
  dataset: string
  provider: string
}

export type PaginatedResponse<T> = ZpiResponse<T[]> & {
  start: number
  length: number
  recordsTotal: number
  recordsFiltered?: number
}

export type ZpiStockSummaryItem = {
  No: number
  Bid: number
  Low: number
  Date: string
  High: number
  Close: number
  Offer: number
  Value: number
  Change: number
  Volume: number
  persen: number | null
  Remarks: string
  Previous: number
  BidVolume: number
  Frequency: number
  OpenPrice: number
  StockCode: string
  StockName: string
  FirstTrade: number
  ForeignBuy: number
  percentage: number | null
  ForeignSell: number
  OfferVolume: number
  ListedShares: number
  DelistingDate: string
  IDStockSummary: number
  TradebleShares: number
  WeightForIndex: number
  IndexIndividual: number
  NonRegularValue: number
  NonRegularVolume: number
  NonRegularFrequency: number
}

export type IndexSummaryItem = {
  No: number
  Date: string
  Close: number
  Value: number
  Change: number
  Lowest: number
  Volume: number
  Highest: number
  Previous: number
  Frequency: number
  IndexCode: string
  MarketCapital: number
  NumberOfStock: number
  IndexSummaryID: number
}

export type TopMoversItem = {
  Code: string
  Price: number
  Value: number
  Change: number
  Volume: number
  Percent: number
  Frequency: number
}

export type BrokerSummaryItem = {
  No: number
  Date: string
  Value: number
  IDFirm: string
  Volume: number
  FirmName: string
  Frequency: number
  IDBrokerSummary: number
}

export type CompanyItem = {
  id: number
  BAE: string
  Fax: string
  Logo: string
  NPKP: string
  NPWP: string
  Email: string
  Alamat: string
  DataID: number
  Divisi: string | null
  Sektor: string
  Status: number
  Telepon: string
  Website: string
  Industri: string
  SubSektor: string
  KodeDivisi: string | null
  KodeEmiten: string
  NamaEmiten: string
  JenisEmiten: string | null
  SubIndustri: string
  EfekEmiten_EBA: boolean
  EfekEmiten_ETF: boolean
  EfekEmiten_SPEI: boolean
  PapanPencatatan: string
  EfekEmiten_Saham: boolean
  TanggalPencatatan: string
  KegiatanUsahaUtama: string
  EfekEmiten_Obligasi: boolean
}

export type SecurityItem = {
  Code: string
  Name: string
  Shares: number
  ListingDate: string
  ListingBoard: string
}

export type FinancialReportAttachment = {
  File_ID: string
  File_Name: string
  File_Path: string
  File_Size: number
  File_Type: string
  NamaEmiten: string
  Emiten_Code: string
  Report_Type: string
  Report_Year: string
  File_Modified: string
  Report_Period: string
}

export type FinancialReportItem = {
  KodeEmiten: string
  NamaEmiten: string
  Attachments: FinancialReportAttachment[]
  Report_Year: string
  File_Modified: string
  Report_Period: string
}

export type MarketActivityResult = {
  Judul: string
  UMAID: string | null
  Status: string | null
  UMADate: string
  CompanyID: string
  Attachment: string
  CompanyName: string | null
  AnnouncementNo: string | null
}

export type MarketActivityResponse = ZpiResponse<{
  Results: MarketActivityResult[]
  ResultCount: number
  SearchCriteria: Record<string, unknown>
}> & {
  type: MarketActivityType
}

export type NewsItem = {
  Id: number
  Tags: string
  Links: Array<{ Rel: string; Href: string; Method: string }>
  Title: string
  ItemId: string
  Locale: string
  Summary: string
  ImageUrl: string
  PathBase: string | null
  PathFile: string | null
  IsHeadline: boolean
  PublishedDate: string
}

export type SitemapResponse = ZpiResponse<string[]> & {
  note: string
  totalUrls: number
  sectionCounts: Record<string, number>
}

export type RawResponse<T = unknown> = ZpiResponse<T> & {
  path: string
  recordsTotal?: number
  recordsFiltered?: number
}

export type AnnouncementItem = {
  id: string
  code: string
  type: string
  title: string
  attachments: Array<{ url: string; fileName: string }>
  publishedAt: string
  announcementNo: string
}

export type AnnouncementsResponse = ZpiResponse<AnnouncementItem[]> & {
  page: number
  total: number
  length: number
  locale: string
}

export type CompanyAnnouncementItem = {
  id: string
  code: string
  type: string
  title: string
  formId: string
  subject: string
  createdAt: string
  attachments: Array<{ url: string; fileName: string }>
  publishedAt: string
  announcementNo: string
}

export type CompanyAnnouncementsResponse = ZpiResponse<CompanyAnnouncementItem[]> & {
  code: string
  start: number
  total: number
  length: number
  locale: string
}

export type ForeignFlowItem = {
  code: string
  name: string
  close: number
  value: number
  volume: number
  foreignBuyShares: number
  netForeignShares: number
  foreignSellShares: number
}

export type ForeignFlowResponse = PaginatedResponse<ForeignFlowItem> & {
  date: string
  sort: string
  unit: string
}

export type MarginSummaryItem = {
  low: number
  code: string
  high: number
  close: number
  value: number
  change: number
  volume: number
  frequency: number
}

export type MarginSummaryResponse = PaginatedResponse<MarginSummaryItem> & {
  date: string
}

export type OwnershipFileItem = {
  url: string
  category: string
  fileName: string
  publishedAt: string
  categoryLabel: string
}

export type OwnershipFilesResponse = PaginatedResponse<OwnershipFileItem> & {
  source: string
}

export type BrokerShareholder = {
  name: string
  type: string
  country: string
  sharePct: number
  ownership: string
}

export type BrokerItem = {
  city: string
  code: string
  logo: string
  mkbd: number
  name: string
  email: string
  phone: string
  address: string
  dataset: string
  license: string
  website: string
  category: string
  provider: string
  branchCount: number
  memberStatus: string
  shareholders?: BrokerShareholder[]
  paidUpCapital: number
  foreignOwnershipPct?: number
}

export type StockHistoryItem = {
  bid: number
  low: number
  date: string
  high: number
  open: number
  close: number
  offer: number
  value: number
  change: number
  volume: number
  previous: number
  frequency: number
  listedShares: number
  foreignBuyValue: number
  netForeignValue: number
  foreignBuyShares: number
  foreignSellValue: number
  netForeignShares: number
  foreignSellShares: number
}

export type StockHistoryResponse = ZpiResponse<StockHistoryItem[]> & {
  code: string
  name: string
  from: string
  to: string
  count: number
  unit: string
  valueBasis: string
}

export type CompanyProfileDirector = {
  name: string
  title: string
}

export type CompanyProfileDividend = {
  type: string
  exDate: string
  cumDate: string
  bookYear: string
  cashTotal: number
  recordDate: string
  bonusShares: number
  paymentDate: string
  cashPerShare: number
}

export type CompanyProfileShareholder = {
  name: string
  shares: number
  category: string
  sharePct: number
}

export type CompanyProfileSubsidiary = {
  name: string
  unit: string
  business: string
  currency: string
  location: string
  totalAssets: number
  ownershipPct: number
  commercialYear: string
  operatingStatus: string
}

export type CompanyProfileBond = {
  isin: string
  name: string
  rating: string
  nominal: number
  trustee: string
  listingDate: string
  maturityDate: string
}

export type CompanyProfileAuditor = {
  name: string
  title: string
}

export type CompanyProfileSecretary = {
  name: string
  email: string
  phone: string
}

export type CompanyProfileResponse = ZpiResponse<Record<string, unknown>> & {
  code: string
  name: string
  logo: string
  fax: string
  email: string
  phone: string
  sector: string
  address: string
  website: string
  industry: string
  subSector: string
  listingDate: string
  listingBoard: string
  subIndustry: string
  mainBusiness: string
  directors: CompanyProfileDirector[]
  commissioners: CompanyProfileAuditor[]
  auditCommittee: CompanyProfileAuditor[]
  corporateSecretary: CompanyProfileSecretary[]
  dividends: CompanyProfileDividend[]
  shareholders: CompanyProfileShareholder[]
  subsidiaries: CompanyProfileSubsidiary[]
  bonds: CompanyProfileBond[]
}

export type TradingInfoDailyResponse = ZpiResponse<Record<string, unknown>> & {
  bid: number
  low: number
  code: string
  high: number
  open: number
  close: number
  offer: number
  value: number
  change: number
  volume: number
  dataset: string
  remarks: string
  previous: number
  provider: string
  bidVolume: number
  boardCode: string
  frequency: number
  summaryId: number
  updatedAt: string
  offerVolume: number
  listedShares: number
  individualIndex: number
}

export type CalendarItem = {
  id: number
  code: string
  date: string
  type?: string
  description: string
}

export type CalendarResponse = ZpiResponse<CalendarItem[]> & {
  date: string
  count: number
  range: string
}

export type IPOItem = {
  code: string
  name: string
  listingDate: string
  listingType: string
  listingBoard: string
  securityType: string
  sharesOffered: number
}

export type CIAResponse = ZpiResponse<IPOItem[]> & {
  start: number
  total: number
  length: number
}

export type LendableStockItem = {
  code: string
  volume: number
  regularBorrowFee: string
  frontEndBorrowFee: string
}

export type LendableStockResponse = ZpiResponse<LendableStockItem[]> & {
  code: string | null
  view: string
  count: number
  files: unknown
  total: number
  topActive: unknown
  topLenderByValue: unknown
  topLenderByFrequency: unknown
}

export type UMAItem = {
  id: string
  code: string
  date: string
  name: string
  title: string
  status: string
  attachment: string
  announcementNo: string
}

export type UMAResponse = ZpiResponse<UMAItem[]> & {
  page: number
  total: number
  dateTo: string
  hasMore: boolean
  keyword: string
  dateFrom: string
  nextPage: number | null
}

export type DerivativesItem = Record<string, unknown>

export type DerivativesResponse = ZpiResponse<DerivativesItem[]> & {
  code: string | null
  count: number
  underlying: string | null
}

export type IndexConstituentItem = {
  low: number
  code: string
  date: string
  high: number
  last: number
  group: string
  change: number
  previous: number
  changePercent: number
}

export type IndexConstituentResponse = ZpiResponse<IndexConstituentItem[]> & {
  code: string | null
  count: number
  group: string
}

export type SuspensionItem = Record<string, unknown>

export type SuspensionResponse = ZpiResponse<SuspensionItem[]> & {
  page: number
  total: number
  hasMore: boolean
  keyword: string
  type: string
  dateFrom: string
  dateTo: string
  nextPage: number | null
}

// ─── Client ─────────────────────────────────────────────────────────────────

export class ZpiIdxClient {
  private readonly apiKey: string | undefined
  private readonly fetchImpl: typeof fetch

  constructor(options: ZpiFetchOptions = {}) {
    const apiKey = options.apiKey ?? process.env['ZPI_API_KEY']
    this.apiKey = apiKey != null && apiKey.trim() !== '' ? apiKey.trim() : undefined
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  isConfigured(): boolean {
    return this.apiKey != null
  }

  // ─── URL builders ───────────────────────────────────────────────────────

  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${ZPI_IDX_BASE_URL}/${endpoint}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.toString()
  }

  stockSummaryUrl(dateInt: number, params?: StockSummaryParams): string {
    return this.buildUrl('stock-summary', {
      length: params?.length ?? 5000,
      start: params?.start ?? 0,
      date: dateInt,
      code: params?.code
    })
  }

  indexSummaryUrl(params?: IndexSummaryParams): string {
    return this.buildUrl('index-summary', {
      length: params?.length,
      start: params?.start,
      date: params?.date
    })
  }

  topMoversUrl(params: TopMoversParams): string {
    return this.buildUrl('top-movers', {
      type: params.type,
      resultCount: params.resultCount
    })
  }

  brokerSummaryUrl(params?: BrokerSummaryParams): string {
    return this.buildUrl('broker-summary', {
      length: params?.length,
      start: params?.start,
      date: params?.date
    })
  }

  companiesUrl(params?: CompaniesParams): string {
    return this.buildUrl('companies', {
      length: params?.length,
      start: params?.start,
      code: params?.code
    })
  }

  securitiesUrl(params?: SecuritiesParams): string {
    return this.buildUrl('securities', {
      length: params?.length,
      start: params?.start,
      code: params?.code,
      sector: params?.sector,
      board: params?.board
    })
  }

  financialReportUrl(params: FinancialReportParams): string {
    return this.buildUrl('financial-report', {
      year: params.year,
      period: params.period,
      code: params.code,
      length: params.length,
      start: params.start
    })
  }

  marketActivityUrl(params: MarketActivityParams): string {
    return this.buildUrl('market-activity', { type: params.type })
  }

  newsUrl(params?: NewsParams): string {
    return this.buildUrl('news', {
      keyword: params?.keyword,
      length: params?.length,
      start: params?.start,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      locale: params?.locale
    })
  }

  sitemapUrl(params?: SitemapParams): string {
    return this.buildUrl('sitemap', {
      locale: params?.locale,
      section: params?.section
    })
  }

  rawUrl(params: RawParams): string {
    return this.buildUrl('raw', { path: params.path, query: params.query })
  }

  announcementsUrl(params?: AnnouncementsParams): string {
    return this.buildUrl('announcements', {
      page: params?.page,
      length: params?.length,
      locale: params?.locale
    })
  }

  companyAnnouncementsUrl(params: CompanyAnnouncementsParams): string {
    return this.buildUrl('company-announcements', {
      code: params.code,
      length: params.length,
      start: params.start,
      locale: params.locale
    })
  }

  foreignFlowUrl(params?: ForeignFlowParams): string {
    return this.buildUrl('foreign-flow', {
      date: params?.date,
      code: params?.code,
      sort: params?.sort,
      length: params?.length,
      start: params?.start
    })
  }

  marginSummaryUrl(params?: MarginSummaryParams): string {
    return this.buildUrl('margin-summary', {
      date: params?.date,
      length: params?.length,
      start: params?.start
    })
  }

  ownershipFilesUrl(params?: OwnershipFilesParams): string {
    return this.buildUrl('ownership-files', {
      category: params?.category,
      length: params?.length,
      start: params?.start
    })
  }

  brokersUrl(params?: BrokersParams): string {
    return this.buildUrl('brokers', {
      code: params?.code,
      view: params?.view
    })
  }

  stockHistoryUrl(params: StockHistoryParams): string {
    return this.buildUrl('stock-history', {
      code: params.code,
      from: params.from,
      to: params.to,
      length: params.length
    })
  }

  companyProfileUrl(code: string): string {
    return this.buildUrl('company-profile', { code })
  }

  tradingInfoDailyUrl(code: string): string {
    return this.buildUrl('trading-info-daily', { code })
  }

  calendarUrl(params?: CalendarParams): string {
    return this.buildUrl('calendar', {
      date: params?.date,
      range: params?.range
    })
  }

  ipoUrl(params?: IPOParams): string {
    return this.buildUrl('ipo', {
      year: params?.year,
      length: params?.length,
      start: params?.start
    })
  }

  lendableStockUrl(params?: LendableStockParams): string {
    return this.buildUrl('lendable-stock', {
      code: params?.code,
      sort: params?.sort,
      view: params?.view
    })
  }

  umaUrl(params?: UMAParams): string {
    return this.buildUrl('uma', {
      page: params?.page,
      length: params?.length,
      keyword: params?.keyword,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo
    })
  }

  derivativesUrl(params?: DerivativesParams): string {
    return this.buildUrl('derivatives', {
      code: params?.code,
      underlying: params?.underlying,
      sort: params?.sort
    })
  }

  indexConstituentUrl(params?: IndexConstituentParams): string {
    return this.buildUrl('index-constituent', {
      code: params?.code,
      group: params?.group
    })
  }

  suspensionUrl(params?: SuspensionParams): string {
    return this.buildUrl('suspension', {
      page: params?.page,
      length: params?.length,
      keyword: params?.keyword,
      type: params?.type,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo
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
      throw new Error(`ZPI API ${response.status}: ${response.statusText}`)
    }
    return response.json() as Promise<T>
  }

  // ─── Data fetchers ──────────────────────────────────────────────────────

  async fetchStockSummary(dateInt: number, params?: StockSummaryParams): Promise<Response> {
    const init = await this.requestInit()
    return this.fetchImpl(this.stockSummaryUrl(dateInt, params), init)
  }

  async fetchIndexSummary(params?: IndexSummaryParams): Promise<PaginatedResponse<IndexSummaryItem>> {
    return this.request<PaginatedResponse<IndexSummaryItem>>(this.indexSummaryUrl(params))
  }

  async fetchTopMovers(params: TopMoversParams): Promise<ZpiResponse<TopMoversItem[]> & { type: string; resultCount: number }> {
    return this.request(this.topMoversUrl(params))
  }

  async fetchBrokerSummary(params?: BrokerSummaryParams): Promise<PaginatedResponse<BrokerSummaryItem>> {
    return this.request<PaginatedResponse<BrokerSummaryItem>>(this.brokerSummaryUrl(params))
  }

  async fetchCompanies(params?: CompaniesParams): Promise<PaginatedResponse<CompanyItem>> {
    return this.request<PaginatedResponse<CompanyItem>>(this.companiesUrl(params))
  }

  async fetchSecurities(params?: SecuritiesParams): Promise<PaginatedResponse<SecurityItem>> {
    return this.request<PaginatedResponse<SecurityItem>>(this.securitiesUrl(params))
  }

  async fetchFinancialReport(params: FinancialReportParams): Promise<ZpiResponse<FinancialReportItem[]> & { year: number; period: string }> {
    return this.request(this.financialReportUrl(params))
  }

  async fetchMarketActivity(params: MarketActivityParams): Promise<MarketActivityResponse> {
    return this.request<MarketActivityResponse>(this.marketActivityUrl(params))
  }

  async fetchNews(params?: NewsParams): Promise<ZpiResponse<NewsItem[]> & { keyword?: string }> {
    return this.request(this.newsUrl(params))
  }

  async fetchSitemap(params?: SitemapParams): Promise<SitemapResponse> {
    return this.request<SitemapResponse>(this.sitemapUrl(params))
  }

  async fetchRaw<T = unknown>(params: RawParams): Promise<RawResponse<T>> {
    return this.request<RawResponse<T>>(this.rawUrl(params))
  }

  async fetchAnnouncements(params?: AnnouncementsParams): Promise<AnnouncementsResponse> {
    return this.request<AnnouncementsResponse>(this.announcementsUrl(params))
  }

  async fetchCompanyAnnouncements(params: CompanyAnnouncementsParams): Promise<CompanyAnnouncementsResponse> {
    return this.request<CompanyAnnouncementsResponse>(this.companyAnnouncementsUrl(params))
  }

  async fetchForeignFlow(params?: ForeignFlowParams): Promise<ForeignFlowResponse> {
    return this.request<ForeignFlowResponse>(this.foreignFlowUrl(params))
  }

  async fetchMarginSummary(params?: MarginSummaryParams): Promise<MarginSummaryResponse> {
    return this.request<MarginSummaryResponse>(this.marginSummaryUrl(params))
  }

  async fetchOwnershipFiles(params?: OwnershipFilesParams): Promise<OwnershipFilesResponse> {
    return this.request<OwnershipFilesResponse>(this.ownershipFilesUrl(params))
  }

  async fetchBrokers(params?: BrokersParams): Promise<ZpiResponse<BrokerItem | BrokerItem[]>> {
    return this.request(this.brokersUrl(params))
  }

  async fetchStockHistory(params: StockHistoryParams): Promise<StockHistoryResponse> {
    return this.request<StockHistoryResponse>(this.stockHistoryUrl(params))
  }

  async fetchCompanyProfile(code: string): Promise<CompanyProfileResponse> {
    return this.request<CompanyProfileResponse>(this.companyProfileUrl(code))
  }

  async fetchTradingInfoDaily(code: string): Promise<TradingInfoDailyResponse> {
    return this.request<TradingInfoDailyResponse>(this.tradingInfoDailyUrl(code))
  }

  async fetchCalendar(params?: CalendarParams): Promise<CalendarResponse> {
    return this.request<CalendarResponse>(this.calendarUrl(params))
  }

  async fetchIPO(params?: IPOParams): Promise<CIAResponse> {
    return this.request<CIAResponse>(this.ipoUrl(params))
  }

  async fetchLendableStock(params?: LendableStockParams): Promise<LendableStockResponse> {
    return this.request<LendableStockResponse>(this.lendableStockUrl(params))
  }

  async fetchUMA(params?: UMAParams): Promise<UMAResponse> {
    return this.request<UMAResponse>(this.umaUrl(params))
  }

  async fetchDerivatives(params?: DerivativesParams): Promise<DerivativesResponse> {
    return this.request<DerivativesResponse>(this.derivativesUrl(params))
  }

  async fetchIndexConstituent(params?: IndexConstituentParams): Promise<IndexConstituentResponse> {
    return this.request<IndexConstituentResponse>(this.indexConstituentUrl(params))
  }

  async fetchSuspension(params?: SuspensionParams): Promise<SuspensionResponse> {
    return this.request<SuspensionResponse>(this.suspensionUrl(params))
  }
}
