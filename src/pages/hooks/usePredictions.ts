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

export type PredictionFilters = {
  symbol?: string
  assetClass?: string
  strategy?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export type CreatePredictionBody = {
  symbol: string
  assetClass?: string
  strategy?: string
  currentPrice?: number
  useDeepSeek?: boolean
  aiProvider?: 'deepseek' | 'opencode'
}

export type PredictionApiError = { code: string; message: string; requestId: string }

export function usePredictions(filters: PredictionFilters) {
  const [data, setData] = useState<Types.PredictionRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchApi<Types.PredictionListResponse>('/api/predictions', {
      ...(filters.symbol !== undefined && filters.symbol !== '' && { symbol: filters.symbol }),
      ...(filters.assetClass !== undefined && filters.assetClass !== '' && { assetClass: filters.assetClass }),
      ...(filters.strategy !== undefined && filters.strategy !== '' && { strategy: filters.strategy }),
      ...(filters.status !== undefined && filters.status !== '' && { status: filters.status }),
      ...(filters.dateFrom !== undefined && filters.dateFrom !== '' && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo !== undefined && filters.dateTo !== '' && { dateTo: filters.dateTo }),
      limit: filters.limit ?? 20,
      offset: filters.offset ?? 0
    })
      .then((response) => {
        if (cancelled) {
          return
        }
        setData(response.data)
        setTotalCount(response.meta.totalCount)
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
  }, [filters.symbol, filters.assetClass, filters.strategy, filters.status, filters.dateFrom, filters.dateTo, filters.limit, filters.offset, requestVersion])

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return { data, totalCount, loading, error, refetch }
}

export function usePredictionStats() {
  const [data, setData] = useState<Types.PredictionStatsResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchApi<Types.PredictionStatsResponse>('/api/predictions/stats')
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
  }, [requestVersion])

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  return { data, loading, error, refetch }
}

export function useCreatePrediction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (body: CreatePredictionBody): Promise<Types.PredictionRow> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchApi<{ data: Types.PredictionRow }>('/api/predictions', undefined, {
        method: 'POST',
        body
      })
      return response.data
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : String(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}
