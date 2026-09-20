/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import * as Hooks from '@app/pages/hooks/index.ts'
import type * as Types from '@app/pages/Types.ts'

const CACHE_TTL_MS = 30 * 60 * 1000
const candidatesCache = new Map<string, { data: Types.CandidatesResponse; timestamp: number }>()

export function clearCandidatesCache(): void {
  candidatesCache.clear()
}

function cacheKeyFromParams(params: Types.CandidatesParams): string {
  return JSON.stringify(params)
}

function buildQueryParams(
  params: Types.CandidatesParams
): Record<string, string | number | boolean> {
  const limit = params.limit != null ? params.limit : 10
  const queryParams: Record<string, string | number | boolean> = { limit }
  if (params.offset != null) {
    queryParams['offset'] = params.offset
  }
  if (params.date != null) {
    queryParams['date'] = params.date
  }
  if (params.setup != null && params.setup !== 'fundamental') {
    queryParams['setup'] = params.setup
  }
  if (params.defaultFilter === true) {
    queryParams['defaultFilter'] = true
  }
  if (params.excludeNotation === true) {
    queryParams['excludeNotation'] = true
  }
  if (params.excludeCorpAction === true) {
    queryParams['excludeCorpAction'] = true
  }
  if (params.excludeUma === true) {
    queryParams['excludeUma'] = true
  }
  if (params.minValue != null) {
    queryParams['minValue'] = params.minValue
  }
  if (params.minVolume != null) {
    queryParams['minVolume'] = params.minVolume
  }
  if (params.perMin != null) {
    queryParams['perMin'] = params.perMin
  }
  if (params.perMax != null) {
    queryParams['perMax'] = params.perMax
  }
  if (params.roeMin != null) {
    queryParams['roeMin'] = params.roeMin
  }
  if (params.derMax != null) {
    queryParams['derMax'] = params.derMax
  }
  if (params.momentumWeek != null) {
    queryParams['momentumWeek'] = params.momentumWeek
  }
  if (params.momentumMin != null) {
    queryParams['momentumMin'] = params.momentumMin
  }
  if (params.withSectorRank === true) {
    queryParams['withSectorRank'] = true
  }
  if (params.exchange != null && params.exchange !== '') {
    queryParams['exchange'] = params.exchange
  }
  if (params.minMarketCapital != null) {
    queryParams['minMarketCapital'] = params.minMarketCapital
  }
  if (params.revenueTtmYoYMin != null) {
    queryParams['revenueTtmYoYMin'] = params.revenueTtmYoYMin
  }
  if (params.relativeStrengthMin != null) {
    queryParams['relativeStrengthMin'] = params.relativeStrengthMin
  }
  if (params.netIncomeTtmYoYMin != null) {
    queryParams['netIncomeTtmYoYMin'] = params.netIncomeTtmYoYMin
  }
  if (params.netMarginMin != null) {
    queryParams['netMarginMin'] = params.netMarginMin
  }
  if (params.pbvMax != null) {
    queryParams['pbvMax'] = params.pbvMax
  }
  if (params.freeCashFlowTtmMin != null) {
    queryParams['freeCashFlowTtmMin'] = params.freeCashFlowTtmMin
  }
  if (params.operatingCashFlowTtmMin != null) {
    queryParams['operatingCashFlowTtmMin'] = params.operatingCashFlowTtmMin
  }
  if (params.roaMin != null) {
    queryParams['roaMin'] = params.roaMin
  }
  if (params.grossMarginMin != null) {
    queryParams['grossMarginMin'] = params.grossMarginMin
  }
  if (params.operatingMarginMin != null) {
    queryParams['operatingMarginMin'] = params.operatingMarginMin
  }
  if (params.requireNewsSentiment === true) {
    queryParams['requireNewsSentiment'] = true
  }
  if (params.minNewsSentiment != null) {
    queryParams['minNewsSentiment'] = params.minNewsSentiment
  }
  if (params.sector != null && params.sector !== '') {
    queryParams['sector'] = params.sector
  }
  if (params.search != null && params.search.trim() !== '') {
    queryParams['search'] = params.search.trim()
  }
  if (params.smartMoneyOnly === true) {
    queryParams['smartMoneyOnly'] = true
  }
  if (params.requireBullishTrend === true) {
    queryParams['requireBullishTrend'] = true
  }
  if (params.requireEarlyReversal === true) {
    queryParams['requireEarlyReversal'] = true
  }
  return queryParams
}

export function useCandidates(params: Types.CandidatesParams) {
  const [response, setResponse] = useState<Types.CandidatesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const fetchCandidates = useCallback(
    (signal?: AbortSignal, skipCache = false) => {
      const key = cacheKeyFromParams(params)
      const cached = candidatesCache.get(key)
      if (!skipCache && cached != null && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setResponse(cached.data)
        setLoading(false)
        setError(null)
        return
      }

      const myId = requestIdRef.current + 1
      requestIdRef.current = myId
      setLoading(true)
      setError(null)
      const queryParams = buildQueryParams(params)
      const opts = signal ? { signal } : undefined
      Hooks.fetchApi<Types.CandidatesResponse>('/api/candidates', queryParams, opts)
        .then((data) => {
          if (requestIdRef.current === myId) {
            setResponse(data)
            candidatesCache.set(key, { data, timestamp: Date.now() })
          }
        })
        .catch((fetchError: unknown) => {
          if (requestIdRef.current !== myId) {
            return
          }
          if (
            fetchError != null &&
            typeof fetchError === 'object' &&
            (fetchError as Error).name === 'AbortError'
          ) {
            return
          }
          setError(fetchError instanceof Error ? fetchError.message : String(fetchError))
        })
        .finally(() => {
          if (requestIdRef.current === myId) {
            setLoading(false)
          }
        })
    },
    [
      params.limit,
      params.offset,
      params.date,
      params.setup,
      params.defaultFilter,
      params.excludeNotation,
      params.excludeCorpAction,
      params.excludeUma,
      params.minValue,
      params.minVolume,
      params.perMin,
      params.perMax,
      params.roeMin,
      params.roaMin,
      params.derMax,
      params.momentumWeek,
      params.momentumMin,
      params.minMarketCapital,
      params.pbvMax,
      params.netMarginMin,
      params.withSectorRank,
      params.exchange,
      params.revenueTtmYoYMin,
      params.netIncomeTtmYoYMin,
      params.freeCashFlowTtmMin,
      params.operatingCashFlowTtmMin,
      params.grossMarginMin,
      params.operatingMarginMin,
      params.relativeStrengthMin,
      params.smartMoneyOnly,
      params.requireBullishTrend,
      params.requireEarlyReversal,
      params.requireNewsSentiment,
      params.minNewsSentiment,
      params.sector,
      params.search
    ]
  )

  useEffect(() => {
    const ctrl = new AbortController()
    fetchCandidates(ctrl.signal)
    return () => ctrl.abort()
  }, [fetchCandidates])

  const refetch = useCallback(() => fetchCandidates(undefined, true), [fetchCandidates])
  return { response, loading, error, refetch }
}
