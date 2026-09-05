import { describe, expect, it } from 'vitest'
import {
  evaluatePrediction,
  type EvaluationBar,
  type EvaluationInput
} from '@app/server/services/prediction/outcomeEvaluation.ts'

const DAY_0 = 20250101
const HORIZON = 5
const ENTRY = 1000
const TARGET = 1100 // +10%
const STOP = 950 // -5%

function bar(dateInt: number, high: number, low: number, close: number): EvaluationBar {
  return { dateInt, high, low, close }
}

function evaluate(bars: EvaluationBar[], todayDateInt = 20250201) {
  const evaluationInput: EvaluationInput = {
    createdDateInt: DAY_0,
    horizonDays: HORIZON,
    entryPrice: ENTRY,
    targetPrice: TARGET,
    stopLoss: STOP,
    bars
  }
  return evaluatePrediction(evaluationInput, todayDateInt)
}

describe('evaluatePrediction', () => {
  it('stays open while the horizon window has not fully elapsed', () => {
    const result = evaluate(
      [bar(DAY_0, 1080, 980, 1050)],
      DAY_0 + HORIZON // today == window end: still open
    )
    expect(result.status).toBe('open')
    expect(result.referencePrice).toBeNull()
  })

  it('wins when the target is reached before the stop', () => {
    const result = evaluate([
      bar(DAY_0 + 1, 1050, 990, 1040),
      bar(DAY_0 + 2, 1120, 1000, 1110) // high >= target first
    ])
    expect(result.status).toBe('won')
    expect(result.referencePrice).toBe(TARGET)
    expect(result.returnPercent).toBeCloseTo(10, 6)
    expect(result.hitTarget).toBe('yes')
    expect(result.hitStop).toBe('no')
  })

  it('loses when the stop is reached first', () => {
    const result = evaluate([
      bar(DAY_0 + 1, 1050, 940, 960), // low <= stop first
      bar(DAY_0 + 2, 1080, 1010, 1060) // neither level touched
    ])
    expect(result.status).toBe('lost')
    expect(result.referencePrice).toBe(STOP)
    expect(result.returnPercent).toBeCloseTo(-5, 6)
    expect(result.hitStop).toBe('yes')
    expect(result.hitTarget).toBe('no')
  })

  it('resolves a same-bar both-hit as a loss (risk-first)', () => {
    const result = evaluate([bar(DAY_0 + 1, 1150, 930, 1000)]) // touches both in one bar
    expect(result.status).toBe('lost')
    expect(result.referencePrice).toBe(STOP)
  })

  it('expires without a trigger and references the last window close', () => {
    const result = evaluate([
      bar(DAY_0 + 1, 1080, 960, 1050),
      bar(DAY_0 + 2, 1090, 970, 1060)
    ])
    expect(result.status).toBe('expired')
    expect(result.referencePrice).toBe(1060)
    expect(result.returnPercent).toBeCloseTo(6, 6)
    expect(result.hitTarget).toBe('no')
    expect(result.hitStop).toBe('no')
  })

  it('tracks max favorable and adverse excursion across the window', () => {
    const result = evaluate([
      bar(DAY_0 + 1, 1080, 990, 1000),
      bar(DAY_0 + 2, 1095, 940, 1050)
    ])
    expect(result.maxFavorableExcursion).toBeCloseTo(9.5, 6)
    expect(result.maxAdverseExcursion).toBeCloseTo(-6, 6)
  })

  it('reports MFE/MAE independently of trigger order', () => {
    // Stop hit first, but the window later reached a higher high: hitTarget
    // still reflects "touched anywhere in the window".
    const result = evaluate([
      bar(DAY_0 + 1, 1030, 930, 960),
      bar(DAY_0 + 2, 1120, 1000, 1110)
    ])
    expect(result.status).toBe('lost')
    expect(result.hitTarget).toBe('yes')
    expect(result.hitStop).toBe('yes')
  })

  it('expires on an empty window and falls back to the latest bar close', () => {
    const result = evaluate([bar(DAY_0 + 10, 1050, 970, 1040)]) // bar outside the window
    expect(result.status).toBe('expired')
    expect(result.referencePrice).toBe(1040)
    expect(result.maxFavorableExcursion).toBeNull()
  })

  it('expires with null reference when there are no bars at all', () => {
    const result = evaluate([])
    expect(result.status).toBe('expired')
    expect(result.referencePrice).toBeNull()
    expect(result.returnPercent).toBeNull()
  })
})
