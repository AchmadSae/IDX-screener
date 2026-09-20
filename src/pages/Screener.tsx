/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart2, TrendingUp } from 'lucide-react'
import * as ScreenerComps from '@app/pages/components/screener/index.ts'
import * as Hooks from '@app/pages/hooks/index.ts'
import * as Utils from '@app/pages/utils/index.ts'
import type * as Types from '@app/pages/Types.ts'

const commonDefaultFilters: Pick<
  Types.CandidatesParams,
  'perMin' | 'perMax' | 'roeMin' | 'derMax' | 'momentumMin' | 'minValue' | 'minVolume'
> = {
  perMin: undefined,
  perMax: 25,
  roeMin: 8,
  derMax: 1.5,
  momentumMin: 5,
  minValue: 5_000_000_000,
  minVolume: 500_000
}

const defaultSetupParams: Omit<Types.CandidatesParams, 'setup' | 'momentumWeek'> = {
  limit: 10,
  offset: 0,
  defaultFilter: true,
  excludeNotation: true,
  excludeCorpAction: true,
  excludeUma: true,
  ...commonDefaultFilters,
  exchange: 'IDX',
  withSectorRank: true
}

const defaultParams: Types.CandidatesParams = {
  ...defaultSetupParams,
  setup: 'fundamental',
  momentumWeek: 13,
  requireNewsSentiment: false
}

const reboundParams: Types.CandidatesParams = {
  ...defaultSetupParams,
  setup: 'rebound',
  momentumWeek: 1,
  requireNewsSentiment: true
}

const swingParams: Types.CandidatesParams = {
  ...defaultSetupParams,
  setup: 'swing',
  momentumWeek: 13,
  requireNewsSentiment: true
}

const paramsBySetup: Record<Types.TradingSetup, Types.CandidatesParams> = {
  fundamental: defaultParams,
  rebound: reboundParams,
  swing: swingParams
}

export default function Screener() {
  const [params, setParams] = useState<Types.CandidatesParams>(defaultParams)
  const [appliedParams, setAppliedParams] = useState<Types.CandidatesParams>(defaultParams)
  const [sectorWeek, setSectorWeek] = useState<1 | 4 | 13 | 26>(4)
  const [sectorFilter, setSectorFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchForRequest, setSearchForRequest] = useState<string>('')
  const [detailCode, setDetailCode] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<Types.MainAnalysisTab>('fundamental')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchForRequestRef = useRef<string>('')
  const { data: generalData } = Hooks.useGeneral()
  const { watchlistCodes, toggleWatchlist } = Hooks.useWatchlist()
  const {
    data: screenerRsiData,
    loading: screenerRsiLoading,
    error: screenerRsiError,
    refetch: refetchScreenerRsi
  } = Hooks.useScreenerRsi()
  const {
    data: screenerBidOfferData,
    loading: screenerBidOfferLoading,
    error: screenerBidOfferError,
    refetch: refetchScreenerBidOffer
  } = Hooks.useScreenerBidOffer()
  const sectors = generalData?.sectors ?? []
  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (searchDebounceRef.current != null) {
      clearTimeout(searchDebounceRef.current)
    }
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null
      setSearchForRequest(trimmed)
      if (trimmed !== lastSearchForRequestRef.current) {
        lastSearchForRequestRef.current = trimmed
        setAppliedParams((prev) => ({ ...prev, offset: 0 }))
        setParams((prev) => ({ ...prev, offset: 0 }))
      }
    }, 300)
    return () => {
      if (searchDebounceRef.current != null) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [searchQuery])

  const requestParams = useMemo(() => {
    const { sector: _s, search: _q, ...rest } = appliedParams
    const result = {
      ...rest,
      ...(sectorFilter.trim() !== '' && { sector: sectorFilter }),
      ...(searchForRequest !== '' && { search: searchForRequest })
    }

    console.info('[screener] candidates params', result)
    return result
  }, [appliedParams, sectorFilter, searchForRequest])
  const {
    response: candidatesResponse,
    loading: candidatesLoading,
    error: candidatesError,
    refetch: refetchCandidates
  } = Hooks.useCandidates(requestParams)

  useEffect(() => {
    if (candidatesError != null && candidatesError !== '') {
      setToast(`Failed to load candidates: ${candidatesError}`)
    }
  }, [candidatesError])
  const { data: sectorData, loading: sectorLoading } = Hooks.useSectorStrength(sectorWeek)
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    fetchDetail,
    clearDetail
  } = Hooks.useStockDetail()

  const handleParamsChange = useCallback((partial: Partial<Types.CandidatesParams>) => {
    setParams((prevParams: Types.CandidatesParams) => ({ ...prevParams, ...partial, offset: 0 }))
  }, [])

  const handleApplyFilter = useCallback(() => {
    const trimmed = searchQuery.trim()
    setSearchForRequest(trimmed)
    const { sector: _s, search: _q, ...rest } = params
    Hooks.clearCandidatesCache()
    setAppliedParams({
      ...rest,
      offset: 0,
      ...(sectorFilter.trim() !== '' && { sector: sectorFilter }),
      ...(trimmed !== '' && { search: trimmed })
    })
  }, [params, sectorFilter, searchQuery])

  const handleDefaultFilter = useCallback(() => {
    const paramsToApply = { ...defaultParams, offset: 0 }
    Hooks.clearCandidatesCache()
    setParams(paramsToApply)
    setAppliedParams(paramsToApply)
    setSectorFilter('')
    setSearchQuery('')
    setSearchForRequest('')
  }, [])

  const handleSetupChange = useCallback((setup: Types.TradingSetup) => {
    const paramsToApply = { ...paramsBySetup[setup], offset: 0 }
    Hooks.clearCandidatesCache()
    setParams(paramsToApply)
    setAppliedParams(paramsToApply)
    setSectorFilter('')
    setSearchQuery('')
    setSearchForRequest('')
  }, [])

  const handlePageChange = useCallback((newOffset: number) => {
    setParams((prevParams: Types.CandidatesParams) => ({ ...prevParams, offset: newOffset }))
    setAppliedParams((prevParams: Types.CandidatesParams) => ({ ...prevParams, offset: newOffset }))
  }, [])

  const handleRowClick = useCallback(
    (code: string) => {
      setDetailCode(code)
      const responseDate = candidatesResponse?.date
      const endDate = responseDate ??
        parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10)
      const startDate = Utils.Format.addDaysToDateInt(endDate, -90)
      fetchDetail(code, startDate, endDate, responseDate)
    },
    [candidatesResponse?.date, fetchDetail]
  )

  const handleCloseModal = useCallback(() => {
    setDetailCode(null)
    clearDetail()
  }, [clearDetail])

  const handleSectorFilterChange = useCallback((sector: string) => {
    setSectorFilter(sector)
    setAppliedParams((prev) => ({ ...prev, offset: 0 }))
    setParams((prev) => ({ ...prev, offset: 0 }))
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const [ingesting, setIngesting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (toastTimerRef.current != null) {
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
    if (toast != null) {
      toastTimerRef.current = setTimeout(() => setToast(null), 4000)
    }
    return () => {
      if (toastTimerRef.current != null) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [toast])
  const handleRefresh = useCallback(async () => {
    setIngesting(true)
    try {
      const res = await Hooks.fetchApi<{ ok: boolean; summaryDate: number }>('/api/ingest', {}, { method: 'POST' })
      if (res.ok) {
        setToast(`Data updated to ${Utils.Format.formatDateInt(res.summaryDate)}`)
        await refetchCandidates()
      } else {
        setToast('Ingestion failed')
      }
    } catch {
      setToast('Ingestion failed')
    }
    setIngesting(false)
  }, [refetchCandidates])

  const dataDate = candidatesResponse?.date ?? 0
  const rawData = candidatesResponse?.data ?? []
  const totalCount = candidatesResponse?.totalCount ?? 0
  const limit = candidatesResponse?.limit ?? 10
  const offset = candidatesResponse?.offset ?? 0
  const totalCountLabel = sectorFilter.trim() !== ''
    ? `sector: ${sectorFilter}`
    : searchForRequest !== ''
    ? `search: "${searchForRequest}"`
    : undefined
  const activeSetup = appliedParams.setup ?? 'fundamental'

  return (
    <div>
      {toast != null && (
        <div className='idx-toast' style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8,
          background: toast.includes('failed') ? '#ef4444' : '#22c55e',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'idx-toast-in 0.3s ease'
        }}>
          {toast}
        </div>
      )}
      <ScreenerComps.DashboardHeader
        totalCount={totalCount}
        date={dataDate}
        onRefresh={handleRefresh}
        loading={candidatesLoading || ingesting}
      />
      <div className='idx-tabs idx-mb-24'>
          <button
            type='button'
            className={`idx-tab idx-tab-inline ${
              mainTab === 'fundamental' && activeSetup === 'fundamental' ? 'idx-tab-active' : ''
            }`}
            onClick={() => {
              setMainTab('fundamental')
              handleSetupChange('fundamental')
            }}
          >
            <BarChart2 size={16} aria-hidden />
            <span>Fundamental</span>
          </button>
          <button
            type='button'
            className={`idx-tab idx-tab-inline ${
              mainTab === 'fundamental' && activeSetup === 'rebound' ? 'idx-tab-active' : ''
            }`}
            onClick={() => {
              setMainTab('fundamental')
              handleSetupChange('rebound')
            }}
          >
            <TrendingUp size={16} aria-hidden />
            <span>Rebound Day</span>
          </button>
          <button
            type='button'
            className={`idx-tab idx-tab-inline ${
              mainTab === 'fundamental' && activeSetup === 'swing' ? 'idx-tab-active' : ''
            }`}
            onClick={() => {
              setMainTab('fundamental')
              handleSetupChange('swing')
            }}
          >
            <TrendingUp size={16} aria-hidden />
            <span>Swing Trade</span>
          </button>
          <button
            type='button'
            className={`idx-tab idx-tab-inline ${mainTab === 'technical' ? 'idx-tab-active' : ''}`}
            onClick={() => setMainTab('technical')}
          >
            <TrendingUp size={16} aria-hidden />
            <span>Technical</span>
          </button>
        </div>
        {mainTab === 'fundamental' && (
          <div className='idx-grid-main'>
            <div>
              <ScreenerComps.FilterPanel
                params={params}
                sectors={sectors}
                sectorFilter={sectorFilter}
                onSectorFilterChange={handleSectorFilterChange}
                onParamsChange={handleParamsChange}
                onApply={handleApplyFilter}
                onDefaultFilter={handleDefaultFilter}
              />
              <div className='idx-mt-24'>
                <ScreenerComps.CandidatesTable
                  data={rawData}
                  limit={limit}
                  offset={offset}
                  totalCount={totalCount}
                  {...(totalCountLabel != null && { totalCountLabel })}
                  onPage={handlePageChange}
                  onRowClick={handleRowClick}
                  searchValue={searchQuery}
                  onSearchChange={handleSearchChange}
                  setup={appliedParams.setup ?? 'fundamental'}
                  loading={candidatesLoading}
                  error={candidatesError}
                  emptyMessage={searchForRequest !== ''
                    ? 'No results for this search.'
                    : 'No candidates match these filters. Loosen the filters or click "Reset To Default".'}
                  watchlistCodes={watchlistCodes}
                  onWatchlistToggle={toggleWatchlist}
                />
              </div>
            </div>
            <aside>
              <ScreenerComps.SectorStrength
                data={sectorData}
                loading={sectorLoading}
                week={sectorWeek}
                onWeekChange={setSectorWeek}
              />
            </aside>
          </div>
        )}
        {mainTab === 'technical' && (
          <div className='idx-technical-row'>
            <ScreenerComps.RsiMarketView
              data={screenerRsiData}
              loading={screenerRsiLoading}
              error={screenerRsiError}
              onRefetch={refetchScreenerRsi}
            />
            <ScreenerComps.BidOfferMarketView
              data={screenerBidOfferData}
              loading={screenerBidOfferLoading}
              error={screenerBidOfferError}
              onRefetch={refetchScreenerBidOffer}
            />
          </div>
        )}
      {detailCode && (
        <ScreenerComps.StockDetailDrawer
          detail={detailData}
          loading={detailLoading}
          error={detailError}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
