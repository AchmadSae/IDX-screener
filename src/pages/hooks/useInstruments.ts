/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { useEffect, useState } from 'react'
import { fetchApi } from '@app/pages/hooks/useClient.ts'
import type * as Types from '@app/pages/Types.ts'

export type InstrumentsResponse = {
  data: Types.InstrumentItem[]
  stale: boolean
}

export function useInstruments() {
  const [data, setData] = useState<Types.InstrumentItem[]>([])
  const [stale, setStale] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchApi<InstrumentsResponse>('/api/instruments')
      .then((response) => {
        if (cancelled) {
          return
        }
        setData(response.data)
        setStale(response.stale)
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
  }, [])

  return { data, stale, loading, error }
}
