/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Candidate query parsing — extracted verbatim from the candidates route so
 * the handler stays thin and the parsing rules are unit-testable.
 */

import Utils from '@app/server/Utils.ts'
import type * as Types from '@app/server/Types.ts'

export function getTradingSetup(raw: string | undefined): Types.TradingSetup {
  return raw === 'rebound' || raw === 'swing' ? raw : 'fundamental'
}

export type CandidateQuery = {
  setup: Types.TradingSetup
  minValue: number | undefined
  minVolume: number | undefined
  excludeNotation: boolean
  excludeCorpAction: boolean
  excludeUma: boolean
  perMin: number | undefined
  perMax: number | undefined
  roeMin: number | undefined
  derMax: number | undefined
  pbvMax: number | undefined
  minMarketCapital: number | undefined
  netMarginMin: number | undefined
  momentumWeek: 1 | 4 | 13 | 26
  momentumMin: number | undefined
  relativeStrengthMin: number | undefined
  smartMoneyOnly: boolean
  requireBullishTrend: boolean
  requireEarlyReversal: boolean
  defaultFilter: boolean
  includeRejected: boolean
  limit: number
  offset: number
  withSectorRank: boolean
  compositeWeights: Types.CompositeWeights | undefined
  sector: string | undefined
  search: string | undefined
  requireNewsSentiment: boolean
  minNewsSentiment: number | undefined
}

export type QueryGetter = (name: string) => string | undefined

export function parseCandidateQuery(query: QueryGetter): CandidateQuery {
  const setup = getTradingSetup(Utils.queryString(query('setup')))
  const minValueRaw = query('minValue')
  const minVolumeRaw = query('minVolume')
  const excludeNotationRaw = query('excludeNotation')
  const excludeCorpActionRaw = query('excludeCorpAction')
  const excludeUmaRaw = query('excludeUma')
  let minValue = Utils.parseNumber(Utils.queryString(minValueRaw))
  let minVolume = Utils.parseNumber(Utils.queryString(minVolumeRaw))
  let excludeNotation = Utils.parseBoolean(Utils.queryString(excludeNotationRaw))
  let excludeCorpAction = Utils.parseBoolean(Utils.queryString(excludeCorpActionRaw))
  let excludeUma = Utils.parseBoolean(Utils.queryString(excludeUmaRaw))
  const perMinRaw = query('perMin')
  const perMaxRaw = query('perMax')
  const roeMinRaw = query('roeMin')
  const derMaxRaw = query('derMax')
  const pbvMaxRaw = query('pbvMax')
  const minMarketCapitalRaw = query('minMarketCapital')
  const netMarginMinRaw = query('netMarginMin')
  const momentumWeekRaw = query('momentumWeek')
  const momentumMinRaw = query('momentumMin')
  const relativeStrengthRaw = query('relativeStrengthMin')
  const smartMoneyOnlyRaw = query('smartMoneyOnly')
  const requireBullishTrendRaw = query('requireBullishTrend')
  const requireEarlyReversalRaw = query('requireEarlyReversal')
  let perMin = Utils.parseNumber(Utils.queryString(perMinRaw))
  let perMax = Utils.parseNumber(Utils.queryString(perMaxRaw))
  let roeMin = Utils.parseNumber(Utils.queryString(roeMinRaw))
  let derMax = Utils.parseNumber(Utils.queryString(derMaxRaw))
  let pbvMax = Utils.parseNumber(Utils.queryString(pbvMaxRaw))
  let minMarketCapital = Utils.parseNumber(Utils.queryString(minMarketCapitalRaw))
  let netMarginMin = Utils.parseNumber(Utils.queryString(netMarginMinRaw))
  let momentumMin = Utils.parseNumber(Utils.queryString(momentumMinRaw))
  let momentumWeek = Utils.parseWeek(Utils.queryString(momentumWeekRaw))
  const relativeStrengthMin = Utils.parseNumber(Utils.queryString(relativeStrengthRaw))
  const smartMoneyOnly = Utils.parseBoolean(Utils.queryString(smartMoneyOnlyRaw))
  const requireBullishTrend = Utils.parseBoolean(Utils.queryString(requireBullishTrendRaw))
  const requireEarlyReversal = Utils.parseBoolean(Utils.queryString(requireEarlyReversalRaw))
  const defaultFilter = Utils.parseBoolean(Utils.queryString(query('defaultFilter')))
  const includeRejected = Utils.parseBoolean(Utils.queryString(query('includeRejected')))
  if (defaultFilter) {
    if (!Utils.queryParamSent(excludeNotationRaw)) {
      excludeNotation = true
    }
    if (!Utils.queryParamSent(excludeCorpActionRaw)) {
      excludeCorpAction = true
    }
    if (!Utils.queryParamSent(excludeUmaRaw)) {
      excludeUma = true
    }
    // Default values tuned per setup
    if (setup === 'fundamental') {
      if (!Utils.queryParamSent(perMinRaw)) {
        perMin = 3
      }
      if (!Utils.queryParamSent(perMaxRaw)) {
        perMax = 18
      }
      if (!Utils.queryParamSent(roeMinRaw)) {
        roeMin = 15
      }
      if (!Utils.queryParamSent(derMaxRaw)) {
        derMax = 0.8
      }
      if (!Utils.queryParamSent(momentumWeekRaw)) {
        momentumWeek = 13
      }
      if (!Utils.queryParamSent(momentumMinRaw)) {
        momentumMin = 10
      }
      if (!Utils.queryParamSent(minValueRaw)) {
        minValue = 10_000_000_000
      }
      if (!Utils.queryParamSent(minVolumeRaw)) {
        minVolume = 1_000_000
      }
      // default exclude flags for fundamental
      if (!Utils.queryParamSent(excludeNotationRaw)) {
        excludeNotation = true
      }
      if (!Utils.queryParamSent(excludeCorpActionRaw)) {
        excludeCorpAction = true
      }
      if (!Utils.queryParamSent(excludeUmaRaw)) {
        excludeUma = true
      }
    } else {
      if (!Utils.queryParamSent(perMaxRaw)) {
        perMax = 25
      }
      if (!Utils.queryParamSent(roeMinRaw)) {
        roeMin = 0
      }
      if (!Utils.queryParamSent(derMaxRaw)) {
        derMax = 2
      }
    }
    if (!Utils.queryParamSent(pbvMaxRaw)) {
      pbvMax = undefined
    }
    if (!Utils.queryParamSent(minMarketCapitalRaw)) {
      minMarketCapital = undefined
    }
    if (!Utils.queryParamSent(netMarginMinRaw)) {
      netMarginMin = undefined
    }
    if (!Utils.queryParamSent(momentumMinRaw)) {
      // if not set above for fundamental, fall back to 0
      momentumMin = momentumMin ?? 0
    }
    if (!Utils.queryParamSent(momentumWeekRaw)) {
      momentumWeek = momentumWeek ?? 26
    }
  }
  const { limit, offset } = Utils.parseLimitOffset(
    Utils.queryString(query('limit')),
    Utils.queryString(query('offset'))
  )
  const withSectorRank = Utils.parseBoolean(Utils.queryString(query('withSectorRank')))
  const valueWeight = Utils.parseWeight(Utils.queryString(query('vw')))
  const qualityWeight = Utils.parseWeight(Utils.queryString(query('qw')))
  const momentumWeight = Utils.parseWeight(Utils.queryString(query('mw')))
  const compositeWeights = Utils.buildCompositeWeights(
    valueWeight,
    qualityWeight,
    momentumWeight
  ) as Types.CompositeWeights | undefined
  const sectorParam = Utils.queryString(query('sector'))?.trim()
  const searchParam = Utils.queryString(query('search'))?.trim().toLowerCase()
  const requireNewsSentiment = Utils.parseBoolean(Utils.queryString(query('requireNewsSentiment')))
  const minNewsSentiment = Utils.parseNumber(Utils.queryString(query('minNewsSentiment')))

  return {
    setup,
    minValue,
    minVolume,
    excludeNotation,
    excludeCorpAction,
    excludeUma,
    perMin,
    perMax,
    roeMin,
    derMax,
    pbvMax,
    minMarketCapital,
    netMarginMin,
    momentumWeek,
    momentumMin,
    relativeStrengthMin,
    smartMoneyOnly,
    requireBullishTrend,
    requireEarlyReversal,
    defaultFilter,
    includeRejected,
    limit,
    offset,
    withSectorRank,
    compositeWeights,
    sector: sectorParam !== undefined && sectorParam !== '' ? sectorParam : undefined,
    search: searchParam !== undefined && searchParam !== '' ? searchParam : undefined,
    requireNewsSentiment,
    minNewsSentiment
  }
}
