import { describe, expect, it } from 'vitest'
import { computeRulePrediction, horizonFor, type RuleInput } from '@app/server/services/prediction/rules.ts'

const strongFundamentals = { roe: 20, der: 0.5, per: 10, week13PC: 5, week26PC: 8 }
const weakFundamentals = { roe: 2, der: 5, per: 999, week13PC: -5, week26PC: -8 }

const bullishIndicators = {
  price: 110,
  rsi14: 55,
  ema20: 105,
  ema50: 100,
  ema200: 95,
  atrPct: 1.5,
  realizedVolPct: 18,
  return20Pct: 4,
  barCount: 120
}

function stockInput(overrides: Partial<RuleInput> = {}): RuleInput {
  return {
    symbol: 'BBCA',
    assetClass: 'stock',
    strategy: 'swing',
    entryPrice: 1000,
    fundamentals: strongFundamentals,
    indicators: bullishIndicators,
    ...overrides
  }
}

function forexInput(overrides: Partial<RuleInput> = {}): RuleInput {
  return {
    symbol: 'XAU/USD',
    assetClass: 'metal',
    strategy: 'swing',
    entryPrice: 2350,
    fundamentals: null,
    indicators: bullishIndicators,
    ...overrides
  }
}

describe('horizonFor', () => {
  it('maps strategies to 1 / 14 / 90 days', () => {
    expect(horizonFor('scalping')).toBe(1)
    expect(horizonFor('swing')).toBe(14)
    expect(horizonFor('long_term')).toBe(90)
  })
})

describe('computeRulePrediction — stocks', () => {
  it('reproduces the v1 score when only fundamentals are supplied (parity)', () => {
    // v1: base 50 + 12 (ROE>=15) + 8 (DER<=0.8) + 8 (PER 3-18) + 10 (momentum>0) = 88
    const output = computeRulePrediction(
      stockInput({ indicators: null, fundamentals: strongFundamentals })
    )
    expect(output.bullishProbability).toBe(88)
    expect(output.ruleScore).toBe(88)
  })

  it('keeps base 50 with risk notes when fundamentals fail every gate', () => {
    const output = computeRulePrediction(
      stockInput({ indicators: null, fundamentals: weakFundamentals })
    )
    expect(output.bullishProbability).toBe(50)
    expect(output.riskNotes).toContain('ROE below preferred threshold')
    expect(output.riskNotes).toContain('DER above preferred threshold')
    expect(output.riskNotes).toContain('PER outside value range')
    expect(output.riskNotes).toContain('Momentum is not supportive')
  })

  it('adds technical deltas on top of fundamentals', () => {
    // 88 + 6 (price>EMA20) + 4 (EMA20>EMA50) + 3 (RSI 40-70) = 101 → clamped to 95
    const output = computeRulePrediction(stockInput())
    expect(output.bullishProbability).toBe(95)
    expect(output.riskNotes).not.toContain('RSI overbought')
  })

  it('penalizes overbought RSI', () => {
    const output = computeRulePrediction(
      stockInput({ indicators: { ...bullishIndicators, rsi14: 82 } })
    )
    // 88 + 6 + 4 - 5 = 93
    expect(output.bullishProbability).toBe(93)
    expect(output.riskNotes).toContain('RSI overbought')
  })

  it('penalizes a long-term structural downtrend', () => {
    const output = computeRulePrediction(
      stockInput({
        strategy: 'long_term',
        indicators: { ...bullishIndicators, price: 97, ema20: 95, ema50: 90, ema200: 100 }
      })
    )
    // 88 + 6 (price>EMA20) + 4 (EMA20>EMA50) + 3 (RSI 40-70) - 8 (price<EMA200) = 93
    expect(output.bullishProbability).toBe(93)
    expect(output.riskNotes).toContain('Price below EMA200 (structural downtrend)')
  })

  it('uses week26PC for long-term momentum and week13PC otherwise', () => {
    const mixedFundamentals = { ...strongFundamentals, week13PC: -3, week26PC: 6 }
    const longTerm = computeRulePrediction(
      stockInput({ strategy: 'long_term', indicators: null, fundamentals: mixedFundamentals })
    )
    expect(longTerm.bullishProbability).toBe(88)
    const swing = computeRulePrediction(
      stockInput({ indicators: null, fundamentals: mixedFundamentals })
    )
    expect(swing.bullishProbability).toBe(78)
  })
})

describe('computeRulePrediction — forex/metals', () => {
  it('scores from technicals only', () => {
    // 50 + 10 (EMA20>EMA50) + 4 (RSI 40-65) + 6 (return20>0) = 70
    const output = computeRulePrediction(forexInput())
    expect(output.bullishProbability).toBe(70)
  })

  it('penalizes downtrend, overbought RSI and negative 20-bar return', () => {
    const output = computeRulePrediction(
      forexInput({
        indicators: {
          ...bullishIndicators,
          ema20: 90,
          ema50: 100,
          rsi14: 80,
          return20Pct: -3
        }
      })
    )
    // 50 - 10 - 4 - 6 = 30
    expect(output.bullishProbability).toBe(30)
  })

  it('falls back to base 50 with a risk note when indicators are missing', () => {
    const output = computeRulePrediction(forexInput({ indicators: null }))
    expect(output.bullishProbability).toBe(50)
    expect(output.riskNotes).toContain('Insufficient price history for technical scoring')
  })
})

describe('computeRulePrediction — sizing', () => {
  it('uses base moves when ATR is unavailable', () => {
    const output = computeRulePrediction(stockInput({ indicators: null }))
    expect(output.targetPrice).toBeCloseTo(1045, 2) // +4.5%
    expect(output.stopLoss).toBeCloseTo(978, 2) // -2.2%
    expect(output.riskNotes).toContain('Default sizing - volatility data unavailable')
  })

  it('widens target and stop with ATR when volatility is high', () => {
    // swing: target = max(4.5, 10 * 2.0) = 20%; stop = max(2.2, 10 * 1.0) = 10%
    const output = computeRulePrediction(
      stockInput({ indicators: { ...bullishIndicators, atrPct: 10 } })
    )
    expect(output.targetPrice).toBeCloseTo(1200, 2)
    expect(output.stopLoss).toBeCloseTo(900, 2)
    expect(output.riskNotes.some((note) => note.startsWith('ATR-based sizing'))).toBe(true)
  })

  it('keeps the stop inside the target even for extreme ATR', () => {
    const output = computeRulePrediction(
      forexInput({ strategy: 'scalping', indicators: { ...bullishIndicators, atrPct: 500 } })
    )
    expect(output.stopLoss).toBeLessThanOrEqual(output.targetPrice)
  })
})

describe('computeRulePrediction — confidence and metadata', () => {
  it('reports 68 confidence for a fully-supported stock and 45 for price-only', () => {
    expect(computeRulePrediction(stockInput()).confidenceScore).toBe(68)
    expect(
      computeRulePrediction(stockInput({ indicators: null })).confidenceScore
    ).toBe(45)
  })

  it('reports 55 for forex with enough bars and 40 otherwise', () => {
    expect(computeRulePrediction(forexInput()).confidenceScore).toBe(55)
    expect(
      computeRulePrediction(
        forexInput({ indicators: { ...bullishIndicators, barCount: 20 } })
      ).confidenceScore
    ).toBe(40)
  })

  it('stamps rules-v2 in metadata', () => {
    expect(computeRulePrediction(stockInput()).metadata.ruleVersion).toBe('rules-v2')
  })
})
