import { describe, expect, it } from 'vitest'
import {
  getGlobalCompositePercentile,
  getTradeAdvisorDecision
} from '@app/pages/components/screener/tradeAdvisorLogic.ts'
import type * as Types from '@app/pages/Types.ts'

function makeDetail(overrides: Partial<Types.StockDetail> = {}): Types.StockDetail {
  return {
    code: 'TEST',
    name: 'Test Tbk',
    sector: 'Test',
    industry: null,
    subSector: null,
    per: 10,
    pbv: 1,
    roa: 4,
    roe: 10,
    der: 1,
    npm: 8,
    marketCapital: 1_000_000_000_000,
    week4PC: 0,
    week13PC: 0,
    week26PC: 0,
    week52PC: 0,
    hasNotation: false,
    hasCorpAction: false,
    hasUma: false,
    valueScore: 0.4,
    qualityScore: 0.6,
    momentumScore: 0.2,
    compositeScore: 46,
    rank: 55,
    compositePercentile: 46,
    rankedCount: 100,
    value: 1_000_000_000,
    volume: 100_000,
    ohlc: [],
    ...overrides
  }
}

function makeCandidate(overrides: Partial<Types.CandidateRow> = {}): Types.CandidateRow {
  return {
    code: 'TEST',
    name: 'Test Tbk',
    sector: 'Test',
    valueScore: 0.4,
    qualityScore: 0.6,
    momentumScore: 0.2,
    compositeScore: 46,
    rank: 1,
    hasNotation: false,
    hasCorpAction: false,
    hasUma: false,
    marketCapital: 1_000_000_000_000,
    per: 10,
    pbv: 1,
    roe: 10,
    der: 1,
    week4PC: 0,
    week13PC: 0,
    week26PC: 0,
    week52PC: 0,
    npm: 8,
    value: 1_000_000_000,
    volume: 100_000,
    changePct: -1,
    price: 900,
    rsi14: 40,
    relVolume: 0.8,
    ema10: 950,
    ema20: 980,
    ema50: 1000,
    ema200: 1100,
    bbBasis20: 960,
    momentum10: -1,
    adx14: 10,
    plusDi14: 10,
    minusDi14: 20,
    recommendationScore: 100,
    recommendationLabel: 'A+ Quality Compounder',
    recommendationReasons: [],
    compositePercentile: 100,
    avgValue20: 1_000_000_000,
    avgVolume20: 100_000,
    relativeStrength: -3,
    selectedMomentumPC: -2,
    bullishTrend: false,
    earlyReversal: false,
    smartMoney: false,
    ...overrides
  }
}

describe('tradeAdvisorLogic', () => {
  it('uses global detail percentile instead of candidate search percentile', () => {
    const detail = makeDetail({ compositePercentile: 46, rank: 55, rankedCount: 100 })
    const candidate = makeCandidate({ compositePercentile: 100 })

    const decision = getTradeAdvisorDecision(detail, candidate)

    expect(getGlobalCompositePercentile(detail, candidate)).toBe(46)
    expect(decision.screenerScore).toBe(46)
    expect(decision.reasons).toContain('Screener score: 46')
    expect(decision.action).toBe('SELL')
  })

  it('can derive global percentile from rank and ranked count', () => {
    const detail = makeDetail({
      compositePercentile: Number.NaN,
      rank: 26,
      rankedCount: 101
    })

    expect(getGlobalCompositePercentile(detail, null)).toBe(75.2)
  })

  it('keeps a strong technical and global-rank setup as BUY', () => {
    const detail = makeDetail({
      compositePercentile: 88,
      week13PC: 12,
      value: 20_000_000_000,
      volume: 2_000_000
    })
    const candidate = makeCandidate({
      compositePercentile: 100,
      selectedMomentumPC: 12,
      price: 1200,
      ema20: 1100,
      ema50: 1000,
      rsi14: 55,
      relVolume: 1.5,
      adx14: 25,
      avgValue20: 20_000_000_000,
      avgVolume20: 2_000_000,
      relativeStrength: 4,
      bullishTrend: true,
      newsSentimentScore: 0,
      newsSentimentCount: 0
    })

    const decision = getTradeAdvisorDecision(detail, candidate)

    expect(decision.action).toBe('BUY')
    expect(decision.score).toBeGreaterThanOrEqual(70)
  })
})
