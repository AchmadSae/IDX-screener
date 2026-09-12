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
const bidOfferCache = new Map<string, { data: Types.ScreenerBidOfferResponse; timestamp: number }>()

export function useScreenerBidOffer(date?: number) {
  const [data, setData] = useState<Types.ScreenerBidOfferResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchBidOffer = useCallback((skipCache = false) => {
    const cacheKey = `bid-offer-${date ?? 'latest'}`

    if (!skipCache) {
      const cached = bidOfferCache.get(cacheKey)
      if (cached != null && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setData(cached.data)
        setLoading(false)
        setError(null)
        return
      }
    }

    const myId = requestIdRef.current + 1
    requestIdRef.current = myId
    setLoading(true)
    setError(null)
    const params = date != null ? { date } : undefined
    Hooks.fetchApi<Types.ScreenerBidOfferResponse>('/api/screener/bid-offer', params)
      .then((result) => {
        if (requestIdRef.current === myId) {
          setData(result)
          bidOfferCache.set(cacheKey, { data: result, timestamp: Date.now() })
        }
      })
      .catch((err) => {
        if (requestIdRef.current !== myId) {
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (requestIdRef.current === myId) {
          setLoading(false)
        }
      })
  }, [date])

  useEffect(() => {
    fetchBidOffer()
  }, [fetchBidOffer])

  const refetch = useCallback(() => fetchBidOffer(true), [fetchBidOffer])

  return { data, loading, error, refetch }
}
