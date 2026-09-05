import { describe, expect, it } from 'vitest'
import {
  atr14,
  ema,
  realizedVol20,
  returnOverBars,
  rsi14,
  sma,
  trueRangeAt
} from '@app/server/services/prediction/indicators.ts'
import {
  atrPeriod2,
  closesAllDown,
  closesAllUp,
  closesAlternating,
  closesConstantReturn,
  closesRsi60
} from '@app/server/fixtures/ohlc.ts'

describe('sma', () => {
  it('averages the last N values', () => {
    expect(sma([1, 2, 3, 4], 2)).toBeCloseTo(3.5, 10)
  })

  it('returns null when there are not enough values', () => {
    expect(sma([1, 2], 3)).toBeNull()
  })
})

describe('ema', () => {
  it('matches the hand-computed SMA-seeded value', () => {
    // seed = avg(1,2,3) = 2; 4 -> 2 + (4-2)*0.5 = 3; 5 -> 3 + (5-3)*0.5 = 4
    expect(ema([1, 2, 3, 4, 5], 3)).toBeCloseTo(4, 10)
  })

  it('returns null when there are not enough values', () => {
    expect(ema([1, 2], 3)).toBeNull()
  })
})

describe('rsi14', () => {
  it('is 100 for an all-up series', () => {
    expect(rsi14(closesAllUp)).toBe(100)
  })

  it('is 0 for an all-down series', () => {
    expect(rsi14(closesAllDown)).toBe(0)
  })

  it('is 50 when average gain equals average loss', () => {
    expect(rsi14(closesAlternating)).toBeCloseTo(50, 10)
  })

  it('is 60 when gains total 3.0 and losses total 2.0 (RS = 1.5)', () => {
    expect(rsi14(closesRsi60)).toBeCloseTo(60, 6)
  })

  it('returns null when there are fewer closes than period + 1', () => {
    expect(rsi14([100, 101])).toBeNull()
  })
})

describe('trueRangeAt', () => {
  it('computes max(high-low, |high-prevClose|, |low-prevClose|)', () => {
    // high-low = 2, |11-9| = 2, |9-9| = 0
    expect(trueRangeAt([10, 11], [8, 9], [9, 10], 1)).toBe(2)
  })

  it('returns null for the first bar', () => {
    expect(trueRangeAt([10, 11], [8, 9], [9, 10], 0)).toBeNull()
  })
})

describe('atr14', () => {
  it('equals 2 when every true range is 2 (period 2)', () => {
    expect(atr14(atrPeriod2.highs, atrPeriod2.lows, atrPeriod2.closes, 2)).toBeCloseTo(2, 10)
  })

  it('returns null when there are not enough bars', () => {
    expect(atr14([10], [9], [9.5], 14)).toBeNull()
  })
})

describe('realizedVol20', () => {
  it('is 0 for a constant-return series', () => {
    expect(realizedVol20(closesConstantReturn)).toBeCloseTo(0, 10)
  })

  it('returns null when there are fewer than 2 returns', () => {
    expect(realizedVol20([100, 110])).toBeNull()
  })
})

describe('returnOverBars', () => {
  it('computes percent change over the last N bars', () => {
    expect(returnOverBars([100, 110, 121], 2)).toBeCloseTo(21, 10)
  })

  it('returns null when there are not enough bars', () => {
    expect(returnOverBars([100], 1)).toBeNull()
  })
})
