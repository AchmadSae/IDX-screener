/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { useEffect, useState } from 'react'
import { fetchApi } from '@app/pages/hooks/useClient.ts'

export type ForexOhlcData = {
  symbol: string
  dateInt: number[]
  priceOpen: (number | null)[]
  priceHigh: (number | null)[]
  priceLow: (number | null)[]
  priceClose: number[]
  volume: (number | null)[]
}

export type ForexOhlcResponse = { data: ForexOhlcData }

export function useForexOhlc(symbol: string | null, days = 90) {
  const [data, setData] = useState<ForexOhlcData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (symbol == null || symbol === '') {
      setData(null)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchApi<ForexOhlcResponse>(
      `/api/instruments/${encodeURIComponent(symbol)}/ohlc`,
      { days }
    )
      .then((response) => {
        if (cancelled) {
          return
        }
        setData(response.data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [symbol, days])

  return { data, loading, error }
}
