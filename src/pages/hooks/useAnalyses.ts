/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { useCallback, useEffect, useState } from 'react'
import { fetchApi } from '@app/pages/hooks/useClient.ts'
import type * as Types from '@app/pages/Types.ts'

export function useAnalysisRuns(limit = 20) {
  const [data, setData] = useState<Types.AnalysisRunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchApi<{ data: Types.AnalysisRunRow[] }>('/api/analyses', { limit })
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
  }, [limit, requestVersion])

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return { data, loading, error, refetch }
}

export function useRunAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (body: {
      symbol: string
      assetClass?: string
      strategy?: string
      currentPrice?: number
    }): Promise<Types.AnalysisResult> => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchApi<{ data: Types.AnalysisResult }>(
          '/api/analyses',
          undefined,
          { method: 'POST', body }
        )
        return response.data
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { run, loading, error }
}
