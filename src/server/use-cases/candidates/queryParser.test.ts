import { describe, expect, it } from 'vitest'
import { parseCandidateQuery } from '@app/server/use-cases/candidates/queryParser.ts'

function parseFromEntries(entries: Record<string, string | undefined>) {
  return parseCandidateQuery((name) => entries[name])
}

describe('parseCandidateQuery', () => {
  it.each([
    ['fundamental', 13],
    ['rebound', 1],
    ['swing', 13]
  ] as const)('applies wider default filters for %s setup', (setup, momentumWeek) => {
    const parsed = parseFromEntries({ defaultFilter: 'true', setup })

    expect(parsed.perMin).toBe(0)
    expect(parsed.perMax).toBe(25)
    expect(parsed.roeMin).toBe(8)
    expect(parsed.derMax).toBe(1.5)
    expect(parsed.momentumWeek).toBe(momentumWeek)
    expect(parsed.momentumMin).toBe(5)
    expect(parsed.minValue).toBe(5_000_000_000)
    expect(parsed.minVolume).toBe(500_000)
    expect(parsed.excludeNotation).toBe(true)
    expect(parsed.excludeCorpAction).toBe(true)
    expect(parsed.excludeUma).toBe(true)
  })

  it('keeps explicit filter values when defaultFilter is enabled', () => {
    const parsed = parseFromEntries({
      defaultFilter: 'true',
      setup: 'rebound',
      perMin: '2',
      momentumWeek: '4',
      minVolume: '100000'
    })

    expect(parsed.perMin).toBe(2)
    expect(parsed.momentumWeek).toBe(4)
    expect(parsed.minVolume).toBe(100_000)
  })
})
