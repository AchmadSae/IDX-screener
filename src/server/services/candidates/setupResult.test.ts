import { describe, expect, it } from 'vitest'
import { setupResult } from '@app/server/services/candidates/Scoring.ts'
import {
  fundamentalBorderlineRow,
  fundamentalFailRow,
  fundamentalPassRow,
  reboundFailRow,
  reboundPassRow,
  swingBorderlineRow
} from '@app/server/fixtures/candidateRows.ts'

const defaultFilters = {
  perMin: undefined,
  perMax: 25,
  roeMin: 8,
  derMax: 1.5,
  momentumMin: 5,
  minValue: 5_000_000_000,
  minVolume: 500_000
}

describe('setupResult — fundamental', () => {
  it('passes a row that meets every gate and labels it A+', () => {
    const result = setupResult(fundamentalPassRow, 'fundamental', defaultFilters)
    expect(result.pass).toBe(true)
    expect(result.reasons).toEqual([])
    expect(result.label).toBe('A+ Quality Compounder')
    // 0.4*80 + 0.3*60 + 0.2*50 + 0.1*70 = 67
    expect(result.score).toBeCloseTo(67, 10)
  })

  it('treats PER 0 and DER 1.5 as inclusive boundaries', () => {
    const result = setupResult(fundamentalBorderlineRow, 'fundamental', defaultFilters)
    expect(result.pass).toBe(true)
    expect(result.reasons).toEqual([])
    expect(result.label).toBe('B Watchlist')
  })

  it('collects every failure reason for a bad row', () => {
    const result = setupResult(fundamentalFailRow, 'fundamental', defaultFilters)
    expect(result.pass).toBe(false)
    expect(result.label).toBe('C Avoid')
    expect(result.reasons).toContain('PER <= 25')
    expect(result.reasons).toContain('ROE >= 8%')
    expect(result.reasons).toContain('DER <= 1.5')
    expect(result.reasons).toContain('Momentum >= 5%')
    expect(result.reasons).toContain('Avg value >= 5000000000')
    expect(result.reasons).toContain('Avg volume >= 500000')
    expect(result.reasons).toContain('Has notation')
    expect(result.reasons).toContain('Has UMA')
    expect(result.reasons).toContain('Has corporate action')
  })
})

describe('setupResult — swing', () => {
  it('passes at exactly 75% (6 of 8 conditions)', () => {
    const result = setupResult(swingBorderlineRow, 'swing')
    expect(result.score).toBe(75)
    expect(result.pass).toBe(true)
    expect(result.label).toBe('Swing Trade')
    expect(result.reasons).toHaveLength(6)
    expect(result.reasons).not.toContain('EMA20 > EMA50')
    expect(result.reasons).not.toContain('ADX > 18')
  })
})

describe('setupResult — rebound', () => {
  it('passes only when every condition holds', () => {
    const pass = setupResult(reboundPassRow, 'rebound')
    expect(pass.pass).toBe(true)
    expect(pass.score).toBe(100)
    expect(pass.label).toBe('Rebound Day')

    const fail = setupResult(reboundFailRow, 'rebound')
    expect(fail.pass).toBe(false)
    // reasons list the PASSED conditions for rebound/swing
    expect(fail.reasons).toContain('Vol > 1M')
    expect(fail.reasons).not.toContain('Price > EMA10')
  })
})
