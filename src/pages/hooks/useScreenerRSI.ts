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
const rsiCache = new Map<string, { data: Types.ScreenerRsiResponse; timestamp: number }>()
const CACHE_KEY = 'screener-rsi'

export function useScreenerRsi() {
  const [data, setData] = useState<Types.ScreenerRsiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchRsi = useCallback((skipCache = false) => {
    if (!skipCache) {
      const cached = rsiCache.get(CACHE_KEY)
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
    Hooks.fetchApi<Types.ScreenerRsiResponse>('/api/screener/rsi')
      .then((result) => {
        if (requestIdRef.current === myId) {
          setData(result)
          rsiCache.set(CACHE_KEY, { data: result, timestamp: Date.now() })
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
  }, [])

  useEffect(() => {
    fetchRsi()
  }, [fetchRsi])

  const refetch = useCallback(() => fetchRsi(true), [fetchRsi])

  return { data, loading, error, refetch }
}
