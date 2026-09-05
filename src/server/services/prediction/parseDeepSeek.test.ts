import { describe, expect, it } from 'vitest'
import { parseDeepSeek } from '@app/server/services/prediction/parseDeepSeek.ts'

const validJson = JSON.stringify({
  label: 'bullish',
  bullishProbability: 72,
  targetPrice: 1050,
  stopLoss: 970,
  horizonDays: 14,
  reasons: ['Strong momentum', 'Sector tailwind'],
  riskWarnings: ['High volatility'],
  confidenceScore: 65,
  disclaimer: 'Analysis support only, not financial advice.'
})

describe('parseDeepSeek', () => {
  it('parses a clean JSON response', () => {
    const parsed = parseDeepSeek(validJson)
    expect(parsed.label).toBe('bullish')
    expect(parsed.bullishProbability).toBe(72)
    expect(parsed.targetPrice).toBe(1050)
    expect(parsed.stopLoss).toBe(970)
    expect(parsed.horizonDays).toBe(14)
    expect(parsed.reasons).toEqual(['Strong momentum', 'Sector tailwind'])
    expect(parsed.riskWarnings).toEqual(['High volatility'])
    expect(parsed.confidenceScore).toBe(65)
    expect(parsed.disclaimer).toContain('Analysis support')
  })

  it('parses a fenced JSON block', () => {
    const parsed = parseDeepSeek(`Here is my analysis:\n\`\`\`json\n${validJson}\n\`\`\`\nHope this helps!`)
    expect(parsed.bullishProbability).toBe(72)
    expect(parsed.label).toBe('bullish')
  })

  it('tolerates trailing prose around the JSON object', () => {
    const parsed = parseDeepSeek(`The setup looks ${validJson} — good luck trading!`)
    expect(parsed.targetPrice).toBe(1050)
  })

  it('returns nulls for invalid JSON', () => {
    const parsed = parseDeepSeek('I cannot provide JSON output for this one.')
    expect(parsed.label).toBeNull()
    expect(parsed.bullishProbability).toBeNull()
    expect(parsed.reasons).toEqual([])
  })

  it('returns nulls for empty or missing content', () => {
    expect(parseDeepSeek('').bullishProbability).toBeNull()
    expect(parseDeepSeek(null).bullishProbability).toBeNull()
    expect(parseDeepSeek(undefined).bullishProbability).toBeNull()
  })

  it('clamps out-of-range probabilities and confidence', () => {
    const parsed = parseDeepSeek(
      JSON.stringify({ label: 'bullish', bullishProbability: 140, confidenceScore: -20 })
    )
    expect(parsed.bullishProbability).toBe(100)
    expect(parsed.confidenceScore).toBe(0)
  })

  it('rejects unknown recommendation labels', () => {
    const parsed = parseDeepSeek(JSON.stringify({ label: 'moon' }))
    expect(parsed.label).toBeNull()
  })

  it('validates horizon as a positive integer within a year', () => {
    expect(parseDeepSeek(JSON.stringify({ horizonDays: 30 })).horizonDays).toBe(30)
    expect(parseDeepSeek(JSON.stringify({ horizonDays: 0 })).horizonDays).toBeNull()
    expect(parseDeepSeek(JSON.stringify({ horizonDays: 14.5 })).horizonDays).toBeNull()
    expect(parseDeepSeek(JSON.stringify({ horizonDays: 400 })).horizonDays).toBeNull()
  })

  it('filters non-string entries out of reason arrays', () => {
    const parsed = parseDeepSeek(
      JSON.stringify({ reasons: ['valid', 42, '', { nested: true }, 'also valid'] })
    )
    expect(parsed.reasons).toEqual(['valid', 'also valid'])
  })
})
