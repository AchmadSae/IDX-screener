/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

export interface CandidateRow {
  code: string
  name: string | null
  sector: string | null
  valueScore: number
  qualityScore: number
  momentumScore: number
  compositeScore: number
  rank: number
  hasNotation: boolean
  hasCorpAction: boolean
  hasUma: boolean
  marketCapital: number | null
  per: number | null
  pbv: number | null
  roe: number | null
  der: number | null
  week1PC?: number | null
  week4PC: number | null
  week13PC: number | null
  week26PC: number | null
  week52PC: number | null
  npm: number | null
  value: number | null
  volume: number | null
  changePct: number | null
  price: number | null
  rsi14: number | null
  relVolume: number | null
  ema10: number | null
  ema20: number | null
  ema50: number | null
  ema200: number | null
  bbBasis20: number | null
  momentum10: number | null
  adx14: number | null
  plusDi14: number | null
  minusDi14: number | null
  recommendationScore: number
  recommendationLabel: string | null
  recommendationReasons: string[]
  compositePercentile: number
  newsSentimentScore?: number | null
  newsSentimentLabel?: string | null
  newsSentimentCount?: number | null
  newsSentimentTitles?: { title: string; link: string }[]
  // Advanced scoring
  fundamentalScore?: number
  valuationScore?: number
  liquidityScore?: number
  totalScore?: number
  avgVolume20?: number | null
  avgValue20?: number | null
  relativeStrength?: number | null
  selectedMomentumPC?: number | null
  bullishTrend?: boolean
  earlyReversal?: boolean
  smartMoney?: boolean
}

export interface CandidateRowWithSectorRank extends CandidateRow {
  sectorRank: number
  sectorPercentile: number
}

export type CandidateTableRow = CandidateRow | CandidateRowWithSectorRank

export type TradingSetup = 'fundamental' | 'rebound' | 'swing'

export interface CandidatesParams {
  date?: string
  limit?: number
  offset?: number
  setup?: TradingSetup
  defaultFilter?: boolean
  excludeNotation?: boolean
  excludeCorpAction?: boolean
  excludeUma?: boolean
  minValue?: number
  minVolume?: number
  perMin?: number
  perMax?: number
  roeMin?: number
  derMax?: number
  roaMin?: number
  revenueTtmYoYMin?: number
  netIncomeTtmYoYMin?: number
  freeCashFlowTtmMin?: number
  operatingCashFlowTtmMin?: number
  grossMarginMin?: number
  operatingMarginMin?: number
  exchange?: string
  requireNewsSentiment?: boolean
  minNewsSentiment?: number
  momentumWeek?: 1 | 4 | 13 | 26
  momentumMin?: number
  // Advanced options
  relativeStrengthMin?: number
  requireBullishTrend?: boolean
  requireEarlyReversal?: boolean
  smartMoneyOnly?: boolean
  minMarketCapital?: number
  pbvMax?: number
  netMarginMin?: number
  withSectorRank?: boolean
  sector?: string
  search?: string
}

export interface CandidatesResponse {
  date: number
  totalCount: number
  limit: number
  offset: number
  serverTimestamp: string
  data: CandidateRow[] | CandidateRowWithSectorRank[]
}

export interface CandidatesTableProps {
  data: CandidateTableRow[]
  limit: number
  offset: number
  totalCount: number
  totalCountLabel?: string
  onPage: (newOffset: number) => void
  onRowClick: (code: string) => void
  searchValue?: string
  onSearchChange?: (searchQuery: string) => void
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  watchlistCodes?: string[]
  onWatchlistToggle?: (code: string, row?: CandidateTableRow) => void
  setup?: TradingSetup
}

export interface ClientOptions {
  signal?: AbortSignal
  method?: 'GET' | 'POST'
  body?: unknown
}

export interface DashboardHeaderProps {
  totalCount: number
  date: number
  onRefresh: () => void
  loading?: boolean
}

export type DetailTab = 'fundamental' | 'technical'

export interface FilterPanelProps {
  params: CandidatesParams
  sectors: string[]
  sectorFilter: string
  onSectorFilterChange: (sector: string) => void
  onParamsChange: (partialParams: Partial<CandidatesParams>) => void
  onApply: () => void | Promise<void>
  onDefaultFilter: () => void
}

export interface ForeignFlowRow {
  date: number
  buy: number | null
  sell: number | null
  net: number | null
}

export type ForeignPeriodDays = 30 | 60 | 90 | 180 | 360

export interface ForeignPeriodOption {
  days: ForeignPeriodDays
  label: string
}

export interface ForeignResponse {
  code: string
  start: number
  end: number
  data: ForeignFlowRow[]
  summary: {
    totalBuy: number
    totalSell: number
    totalNet: number
    dayCount: number
  }
}

export interface GeneralResponse {
  stockList: { code: string; name: string }[]
  industries: string[]
  sectors: string[]
  subSectors: string[]
  subIndustries: string[]
}

export interface HistoryBidOfferByDateEntry {
  date: number
  sectors: Record<string, HistorySectorAggregate>
}

export interface HistoryBidOfferResponse {
  start: number
  end: number
  byDate: HistoryBidOfferByDateEntry[]
  bySector: HistoryBidOfferSectorItem[]
}

export interface HistoryBidOfferSectorItem {
  sector: string
  totalBid: number
  totalOffer: number
  dayCount: number
  avgBid: number
  avgOffer: number
  ratio: number | null
}

export interface HistorySectorAggregate {
  bidVolume: number
  offerVolume: number
  count: number
}

export type HomeTab = 'methodology' | 'score' | 'filter' | 'howTo'

export type MainAnalysisTab = 'fundamental' | 'technical' | 'watchlist'

export interface OhlcApiRow extends StockDetailOhlcRow {
  bidVolume: number | null
  offerVolume: number | null
}

export interface RsiResponse {
  code: string
  start: number
  end: number
  period: number
  data: RsiRow[]
  sector: string | null
  sectorData: RsiRow[]
}

export interface RsiRow {
  date: number
  rsi: number | null
}

export interface ScreenerBidOfferItem {
  sector: string
  bidVolume: number
  offerVolume: number
  count: number
}

export interface ScreenerBidOfferResponse {
  date: number
  data: ScreenerBidOfferItem[]
}

export interface ScreenerRsiItem {
  code: string
  name: string | null
  sector: string | null
  rsi: number | null
}

export interface ScreenerRsiResponse {
  date: number
  period: number
  data: { byCode: ScreenerRsiItem[]; bySector: Record<string, ScreenerRsiItem[]> }
}

export interface RsiMarketViewProps {
  data: ScreenerRsiResponse | null
  loading: boolean
  error: string | null
  onRefetch: () => void
}

export interface BidOfferMarketViewProps {
  data: ScreenerBidOfferResponse | null
  loading: boolean
  error: string | null
  onRefetch: () => void
}

export interface SectorStrengthProps {
  data: SectorStrengthRow[] | null
  loading: boolean
  week: 1 | 4 | 13 | 26
  onWeekChange: (week: 1 | 4 | 13 | 26) => void
}

export interface SectorStrengthRow {
  sector: string
  avgMomentum: number
  count: number
  rank: number
}

export interface SectorStrengthTooltipPayload {
  sector: string
  avgMomentum: number
}

export interface StockDetail {
  code: string
  name: string | null
  sector: string | null
  industry: string | null
  subSector: string | null
  per: number | null
  pbv: number | null
  roa: number | null
  roe: number | null
  der: number | null
  npm: number | null
  marketCapital: number | null
  week4PC: number | null
  week13PC: number | null
  week26PC: number | null
  week52PC: number | null
  hasNotation: boolean
  hasCorpAction: boolean
  hasUma: boolean
  valueScore: number
  qualityScore: number
  momentumScore: number
  compositeScore: number
  rank: number
  value: number | null
  volume: number | null
  ohlc: StockDetailOhlcRow[]
}

export type RsiChartPoint = { date: string; rsi: number; sectorRsi: number | null }

export interface StockDetailModalProps {
  detail: StockDetail | null
  loading: boolean
  error: string | null
  onClose: () => void
}

export interface StockDetailOhlcRow {
  date: number
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
  change: number | null
}

export type PriceLinePoint = { date: string; close: number }

/* Prediction domain */

export type PredictionAssetClass = 'stock' | 'forex' | 'metal'
export type PredictionStrategy = 'scalping' | 'swing' | 'long_term'
export type PredictionStatus = 'open' | 'won' | 'lost' | 'expired'
export type PredictionAiStatus = 'ok' | 'failed' | 'skipped' | 'off'

export interface PredictionAiRun {
  runId: string | null
  status: string
  model: string
  promptVersion: string
  errorMessage: string | null
  tokens: { promptTokens: number; completionTokens: number } | null
  estimatedCostUsd: number | null
}

export interface PredictionOutcome {
  id: string
  predictionId: string
  evaluatedAt: string
  referencePrice: number
  returnPercent: number
  maxFavorableExcursion: number | null
  maxAdverseExcursion: number | null
  hitTarget: string
  hitStop: string
}

export interface PredictionRow {
  id: string
  symbol: string
  assetClass: PredictionAssetClass
  strategy: PredictionStrategy
  horizonDays: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  bullishProbability: number
  confidenceScore: number
  ruleScore: number
  aiScore: number | null
  aiSummary: string | null
  riskNotes: string[]
  status: PredictionStatus
  modelVersion: string
  metadata: Record<string, unknown>
  createdAt: string
  outcome: PredictionOutcome | null
  aiStatus?: PredictionAiStatus
  aiRun?: PredictionAiRun | null
}

export interface PredictionListResponse {
  data: PredictionRow[]
  meta: { totalCount: number; limit: number; offset: number }
}

export interface PredictionStatsGroup {
  count: number
  settledCount: number
  winRate: number | null
  avgReturn: number | null
  avgDrawdown: number | null
}

export interface PredictionStatsResponse {
  data: {
    counts: { total: number; open: number; won: number; lost: number; expired: number }
    overall: {
      winRate: number | null
      avgReturn: number | null
      avgDrawdown: number | null
      settledCount: number
    }
    byStrategy: (PredictionStatsGroup & { strategy: string })[]
    byAssetClass: (PredictionStatsGroup & { assetClass: string })[]
    calibration: { bucket: string; count: number; winRate: number | null }[]
  }
}

export interface InstrumentItem {
  symbol: string
  displayName: string
  assetClass: PredictionAssetClass
  currency: string | null
  exchange: string | null
  provider: string | null
  latestPrice: number | null
  latestDateInt: number | null
  dayChangePct: number | null
}

export interface AnalysisRunRow {
  id: string
  predictionId: string | null
  symbol: string
  assetClass: PredictionAssetClass
  strategy: PredictionStrategy
  provider: string
  model: string
  promptVersion: string
  status: string
  inputHash: string | null
  responseSummary: string | null
  errorMessage: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AnalysisResult {
  runId: string | null
  symbol: string
  assetClass: PredictionAssetClass
  strategy: PredictionStrategy
  promptVersion: string
  model: string
  status: string
  rulePrediction: {
    entryPrice: number
    targetPrice: number
    stopLoss: number
    bullishProbability: number
    confidenceScore: number
    ruleScore: number
    horizonDays: number
    riskNotes: string[]
    metadata: Record<string, unknown>
  }
  aiResult: {
    label: 'bullish' | 'neutral' | 'bearish' | null
    bullishProbability: number | null
    targetPrice: number | null
    stopLoss: number | null
    horizonDays: number | null
    reasons: string[]
    riskWarnings: string[]
    confidenceScore: number | null
    disclaimer: string | null
  } | null
  aiSummary: string | null
  errorMessage: string | null
  tokens: { promptTokens: number; completionTokens: number } | null
  estimatedCostUsd: number | null
}
