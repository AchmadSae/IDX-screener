/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Filter, History as HistoryIcon } from 'lucide-react'
import * as Utils from '@app/pages/utils/index.ts'
import PageHeader from '@app/pages/components/common/PageHeader.tsx'
import KpiCard from '@app/pages/components/common/KpiCard.tsx'
import StatusBadge from '@app/pages/components/common/StatusBadge.tsx'
import Disclaimer from '@app/pages/components/common/Disclaimer.tsx'
import { usePredictions, usePredictionStats } from '@app/pages/hooks/usePredictions.ts'
import type * as Types from '@app/pages/Types.ts'

const PAGE_SIZE = 20

export default function History() {
  const [symbol, setSymbol] = useState('')
  const [assetClass, setAssetClass] = useState('')
  const [strategy, setStrategy] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [offset, setOffset] = useState(0)

  const filters = useMemo(
    () => ({
      symbol: symbol.trim().toUpperCase(),
      assetClass,
      strategy,
      status,
      dateFrom,
      dateTo,
      limit: PAGE_SIZE,
      offset
    }),
    [symbol, assetClass, strategy, status, dateFrom, dateTo, offset]
  )
  const { data, totalCount, loading, error, refetch } = usePredictions(filters)
  const { data: stats } = usePredictionStats()

  const handleApply = useCallback(() => {
    setOffset(0)
    refetch()
  }, [refetch])

  const handlePrevPage = useCallback(() => {
    setOffset((current) => Math.max(0, current - PAGE_SIZE))
  }, [])

  const handleNextPage = useCallback(() => {
    setOffset((current) => current + PAGE_SIZE)
  }, [])

  const pageStart = totalCount === 0 ? 0 : offset + 1
  const pageEnd = Math.min(offset + PAGE_SIZE, totalCount)
  const statsRows: Types.PredictionRow[] = data

  return (
    <div>
      <PageHeader
        title='Prediction History'
        subtitle='Every prediction is tracked and settled against actual prices after its horizon.'
      />
      <div className='idx-kpi-strip'>
        <KpiCard
          label='Total Predictions'
          value={stats != null ? Utils.Format.formatNum(stats.counts.total, 0) : '…'}
          icon={HistoryIcon}
        />
        <KpiCard
          label='Win Rate'
          value={
            stats?.overall.winRate != null ? `${stats.overall.winRate.toFixed(1)}%` : '—'
          }
          delta={
            stats != null
              ? `${stats.counts.won}W · ${stats.counts.lost}L · ${stats.counts.expired}E`
              : undefined
          }
        />
        <KpiCard
          label='Avg Return'
          value={
            stats?.overall.avgReturn != null ? Utils.Format.formatPct(stats.overall.avgReturn) : '—'
          }
          deltaDirection={(stats?.overall.avgReturn ?? 0) >= 0 ? 'up' : 'down'}
          delta='settled'
        />
        <KpiCard
          label='Avg Drawdown'
          value={
            stats?.overall.avgDrawdown != null
              ? Utils.Format.formatPct(-stats.overall.avgDrawdown)
              : '—'
          }
          deltaDirection='down'
          delta='settled'
        />
        <KpiCard
          label='Open'
          value={stats != null ? Utils.Format.formatNum(stats.counts.open, 0) : '…'}
        />
      </div>

      <div className='idx-history-layout'>
        <section className='idx-card idx-history-filters'>
          <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
            <Filter size={18} aria-hidden />
            <span>Filters</span>
          </div>
          <div className='idx-field idx-mb-12'>
            <label className='idx-field-label' htmlFor='history-symbol'>
              Symbol
            </label>
            <input
              id='history-symbol'
              type='text'
              className='idx-input'
              placeholder='BBCA, XAU/USD…'
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
            />
          </div>
          <div className='idx-field idx-mb-12'>
            <label className='idx-field-label' htmlFor='history-asset-class'>
              Asset Class
            </label>
            <select
              id='history-asset-class'
              className='idx-input'
              value={assetClass}
              onChange={(event) => setAssetClass(event.target.value)}
            >
              <option value=''>All</option>
              <option value='stock'>Stock</option>
              <option value='forex'>Forex</option>
              <option value='metal'>Metal</option>
            </select>
          </div>
          <div className='idx-field idx-mb-12'>
            <label className='idx-field-label' htmlFor='history-strategy'>
              Strategy
            </label>
            <select
              id='history-strategy'
              className='idx-input'
              value={strategy}
              onChange={(event) => setStrategy(event.target.value)}
            >
              <option value=''>All</option>
              <option value='scalping'>Scalping</option>
              <option value='swing'>Swing</option>
              <option value='long_term'>Long Term</option>
            </select>
          </div>
          <div className='idx-field idx-mb-12'>
            <label className='idx-field-label' htmlFor='history-status'>
              Status
            </label>
            <select
              id='history-status'
              className='idx-input'
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value=''>All</option>
              <option value='open'>Open</option>
              <option value='won'>Won</option>
              <option value='lost'>Lost</option>
              <option value='expired'>Expired</option>
            </select>
          </div>
          <div className='idx-field idx-mb-12'>
            <label className='idx-field-label' htmlFor='history-date-from'>
              From (yyyymmdd)
            </label>
            <input
              id='history-date-from'
              type='text'
              className='idx-input'
              placeholder='20260101'
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className='idx-field idx-mb-16'>
            <label className='idx-field-label' htmlFor='history-date-to'>
              To (yyyymmdd)
            </label>
            <input
              id='history-date-to'
              type='text'
              className='idx-input'
              placeholder='20261231'
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          <button type='button' className='idx-btn idx-btn-primary idx-btn-block' onClick={handleApply}>
            Apply Filters
          </button>
          <p className='idx-p-muted idx-mt-12 idx-history-lazy-note'>
            Outcomes refresh automatically on load — open predictions settle once
            their horizon window has fully elapsed.
          </p>
          <Disclaimer />
        </section>

        <section className='idx-history-main'>
          {stats != null && stats.byStrategy.some((group) => group.count > 0) && (
            <div className='idx-card idx-mb-16 idx-history-strategy-strip'>
              {stats.byStrategy
                .filter((group) => group.count > 0)
                .map((group) => (
                  <div key={group.strategy} className='idx-history-strategy-cell'>
                    <span className='idx-prediction-metric-label'>
                      {group.strategy.replace('_', ' ')}
                    </span>
                    <span className='idx-history-strategy-value'>
                      {group.winRate != null ? `${group.winRate.toFixed(1)}%` : '—'}
                    </span>
                    <span className='idx-history-strategy-sub'>
                      {group.settledCount}/{group.count} settled
                    </span>
                  </div>
                ))}
            </div>
          )}
          <div className='idx-card idx-table-wrap'>
            <table className='idx-table idx-table-dense'>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Symbol</th>
                  <th>Strategy</th>
                  <th>Entry</th>
                  <th>Target</th>
                  <th>Stop</th>
                  <th>Prob</th>
                  <th>Conf</th>
                  <th>Status</th>
                  <th>Return</th>
                  <th>MFE</th>
                  <th>MAE</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className='idx-table-empty-cell' colSpan={12}>
                      Loading…
                    </td>
                  </tr>
                )}
                {error != null && (
                  <tr>
                    <td className='idx-table-error-cell' colSpan={12}>
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && error == null && statsRows.length === 0 && (
                  <tr>
                    <td className='idx-table-empty-cell' colSpan={12}>
                      No predictions match these filters.
                    </td>
                  </tr>
                )}
                {statsRows.map((prediction) => (
                  <tr key={prediction.id}>
                    <td className='idx-table-muted'>
                      {new Date(prediction.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      })}
                    </td>
                    <td className='idx-table-code-bold'>{prediction.symbol}</td>
                    <td className='idx-table-muted'>{prediction.strategy.replace('_', ' ')}</td>
                    <td>{Utils.Format.formatPrice(prediction.entryPrice, prediction.assetClass)}</td>
                    <td className='idx-pct-up'>
                      {Utils.Format.formatPrice(prediction.targetPrice, prediction.assetClass)}
                    </td>
                    <td className='idx-pct-down'>
                      {Utils.Format.formatPrice(prediction.stopLoss, prediction.assetClass)}
                    </td>
                    <td>{Utils.Format.formatPct(prediction.bullishProbability)}</td>
                    <td>{prediction.confidenceScore.toFixed(0)}</td>
                    <td>
                      <StatusBadge status={prediction.status} />
                    </td>
                    <td
                      className={
                        prediction.outcome == null
                          ? 'idx-table-muted'
                          : prediction.outcome.returnPercent >= 0
                          ? 'idx-pct-up'
                          : 'idx-pct-down'
                      }
                    >
                      {prediction.outcome != null
                        ? Utils.Format.formatPct(prediction.outcome.returnPercent)
                        : '—'}
                    </td>
                    <td className='idx-table-muted'>
                      {prediction.outcome?.maxFavorableExcursion != null
                        ? Utils.Format.formatPct(prediction.outcome.maxFavorableExcursion)
                        : '—'}
                    </td>
                    <td className='idx-table-muted'>
                      {prediction.outcome?.maxAdverseExcursion != null
                        ? Utils.Format.formatPct(prediction.outcome.maxAdverseExcursion)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='idx-pagination idx-mt-16'>
            <span>
              {totalCount === 0 ? 'Rows 0 of 0' : `Rows ${pageStart}–${pageEnd} of ${totalCount}`}
            </span>
            <div>
              <button
                type='button'
                className='idx-btn'
                onClick={handlePrevPage}
                disabled={offset === 0}
              >
                Previous
              </button>
              <button
                type='button'
                className='idx-btn'
                onClick={handleNextPage}
                disabled={pageEnd >= totalCount}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
