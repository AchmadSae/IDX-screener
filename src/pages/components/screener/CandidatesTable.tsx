/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { ChevronLeft, ChevronRight, Search, Star } from 'lucide-react'
import * as Utils from '@app/pages/utils/index.ts'
import type * as Types from '@app/pages/Types.ts'

const fundamentalColumnCount = 10
const tradingColumnCount = 10

export default function CandidatesTable({
  data,
  limit,
  offset,
  totalCount,
  totalCountLabel,
  onPage,
  onRowClick,
  searchValue = '',
  onSearchChange,
  loading = false,
  error = null,
  emptyMessage,
  watchlistCodes,
  onWatchlistToggle,
  setup = 'fundamental'
}: Types.CandidatesTableProps) {
  const hasWatchlist = watchlistCodes != null && onWatchlistToggle != null
  const isTradingSetup = setup === 'rebound' || setup === 'swing'
  const dataColumnCount = isTradingSetup ? tradingColumnCount : fundamentalColumnCount
  const columnCount = hasWatchlist ? dataColumnCount + 1 : dataColumnCount
  const fromRow = totalCount === 0 ? 0 : offset + 1
  const toRow = Math.min(offset + data.length, offset + totalCount)
  const hasPrevPage = offset > 0
  const hasNextPage = !totalCountLabel && offset + limit < totalCount
  const showEmptyRow = data.length === 0 && !loading && !error
  const showLoadingRow = data.length === 0 && loading
  const showErrorRow = error != null && error !== ''

  const handleRowKeyDown = (code: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowClick(code)
    }
  }
  const handleStarClick = (code: string, row: Types.CandidateTableRow, event: React.MouseEvent) => {
    event.stopPropagation()
    const inList = watchlistCodes!.includes(code)
    onWatchlistToggle?.(code, inList ? undefined : row)
  }
  const handleStarKeyDown = (
    code: string,
    row: Types.CandidateTableRow,
    event: React.KeyboardEvent
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      const inList = watchlistCodes!.includes(code)
      onWatchlistToggle?.(code, inList ? undefined : row)
    }
  }

  return (
    <div className='idx-card'>
      {onSearchChange && (
        <div className='idx-table-search'>
          <Search size={18} className='idx-table-search-icon' aria-hidden />
          <input
            type='search'
            className='idx-table-search-input'
            placeholder='Search code, name, or sector...'
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label='Search code, name, or sector'
          />
        </div>
      )}
      <div className='idx-table-wrap'>
        <table className='idx-table'>
          <thead>
            {isTradingSetup
              ? (
                <tr>
                  {hasWatchlist && (
                    <th className='idx-table-col-watchlist' scope='col' aria-label='Watchlist'>
                      <Star size={14} aria-hidden className='idx-table-star-header' />
                    </th>
                  )}
                  <th className='idx-table-col-kode'>Code</th>
                  <th className='idx-table-col-sector'>Sector</th>
                  <th className='idx-table-th-right'>Price</th>
                  <th className='idx-table-th-right'>Chg</th>
                  <th className='idx-table-th-right'>Vol</th>
                  <th className='idx-table-th-right'>Rel Vol</th>
                  <th className='idx-table-th-right'>RSI</th>
                  <th className='idx-table-th-right'>{setup === 'swing' ? 'ADX' : 'EMA10'}</th>
                  <th className='idx-table-th-right'>Score</th>
                  <th>Reasons</th>
                </tr>
              )
              : (
                <tr>
                  {hasWatchlist && (
                    <th className='idx-table-col-watchlist' scope='col' aria-label='Watchlist'>
                      <Star size={14} aria-hidden className='idx-table-star-header' />
                    </th>
                  )}
                  <th className='idx-table-col-kode'>Code</th>
                  <th className='idx-table-col-nama'>Name</th>
                  <th className='idx-table-col-sector'>Sector</th>
                  <th className='idx-table-th-right'>PER</th>
                  <th className='idx-table-th-right'>ROE</th>
                  <th className='idx-table-th-right'>DER</th>
                  <th className='idx-table-th-right'>26w (%)</th>
                  <th className='idx-table-th-right'>52w (%)</th>
                  <th className='idx-table-th-right'>Comp (%)</th>
                  <th className='idx-table-th-right'>Sentiment</th>
                </tr>
              )}
          </thead>
          <tbody>
            {showErrorRow && (
              <tr className='idx-table-message-row'>
                <td colSpan={columnCount} className='idx-table-empty-cell idx-table-error-cell'>
                  {error}
                </td>
              </tr>
            )}
            {showLoadingRow && (
              <tr className='idx-table-message-row'>
                <td colSpan={columnCount} className='idx-table-empty-cell'>
                  Loading candidates…
                </td>
              </tr>
            )}
            {showEmptyRow && emptyMessage != null && (
              <tr className='idx-table-message-row'>
                <td colSpan={columnCount} className='idx-table-empty-cell'>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!showErrorRow &&
              !showLoadingRow &&
              !showEmptyRow &&
              data.map((candidateRow) => (
                <tr
                  key={candidateRow.code}
                  tabIndex={0}
                  role='button'
                  onClick={() => onRowClick(candidateRow.code)}
                  onKeyDown={(event) => handleRowKeyDown(candidateRow.code, event)}
                  aria-label={`Buka detail ${candidateRow.code} ${candidateRow.name ?? ''}`}
                >
                  {hasWatchlist && (
                    <td className='idx-table-col-watchlist'>
                      <button
                        type='button'
                        className={`idx-watchlist-btn ${
                          watchlistCodes!.includes(candidateRow.code) ? 'idx-watchlist-on' : ''
                        }`}
                        onClick={(e) => handleStarClick(candidateRow.code, candidateRow, e)}
                        onKeyDown={(e) => handleStarKeyDown(candidateRow.code, candidateRow, e)}
                        aria-label={watchlistCodes!.includes(candidateRow.code)
                          ? `Remove ${candidateRow.code} from watchlist`
                          : `Add ${candidateRow.code} to watchlist`}
                      >
                        <Star size={16} aria-hidden />
                      </button>
                    </td>
                  )}
                  {isTradingSetup
                    ? (
                      <>
                        <td className='idx-table-col-kode'>
                          <span className='idx-table-code-bold'>{candidateRow.code}</span>
                          <span className='idx-table-name-muted'>{candidateRow.name ?? '-'}</span>
                        </td>
                        <td className='idx-table-col-sector'>{candidateRow.sector ?? '-'}</td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatRp(candidateRow.price)}
                        </td>
                        <td className='idx-table-td-right'>
                          <span
                            className={candidateRow.changePct != null
                              ? candidateRow.changePct >= 0
                                ? 'idx-pct idx-pct-up'
                                : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(candidateRow.changePct ?? null)}
                          </span>
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatRp(candidateRow.volume)}
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.relVolume, 2)}
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.rsi14, 1)}
                        </td>
                        <td className='idx-table-td-right'>
                          {setup === 'swing'
                            ? Utils.Format.formatNum(candidateRow.adx14, 1)
                            : Utils.Format.formatRp(candidateRow.ema10)}
                        </td>
                        <td className='idx-table-td-right'>
                          <span className='idx-score-pill'>
                            {Utils.Format.formatNum(candidateRow.recommendationScore, 0)}
                          </span>
                        </td>
                        <td>
                          <div className='idx-reason-list'>
                            {candidateRow.newsSentimentScore != null &&
                                (candidateRow.newsSentimentCount ?? 0) > 0
                              ? (
                                <span
                                  className={`idx-sentiment-chip ${
                                    candidateRow.newsSentimentScore > 0
                                      ? 'idx-sentiment-pos'
                                      : candidateRow.newsSentimentScore < 0
                                      ? 'idx-sentiment-neg'
                                      : 'idx-sentiment-neutral'
                                  }`}
                                >
                                  Sent: {Utils.Format.formatNum(candidateRow.newsSentimentScore, 2)}
                                </span>
                              )
                              : <span className='idx-muted'>Sent: N/A</span>}
                            {candidateRow.recommendationReasons.slice(0, 3).map((reason) => (
                              <span key={reason} className='idx-reason-chip'>
                                {reason}
                              </span>
                            ))}
                          </div>
                        </td>
                      </>
                    )
                    : (
                      <>
                        <td className='idx-table-col-kode'>
                          <span className='idx-table-code-bold'>{candidateRow.code}</span>
                        </td>
                        <td className='idx-table-col-nama'>{candidateRow.name ?? '-'}</td>
                        <td className='idx-table-col-sector'>{candidateRow.sector ?? '-'}</td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.per, 1)}
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.roe, 1)}
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.der, 1)}
                        </td>
                        <td className='idx-table-td-right'>
                          <span
                            className={candidateRow.week26PC != null
                              ? candidateRow.week26PC >= 0
                                ? 'idx-pct idx-pct-up'
                                : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(candidateRow.week26PC ?? null)}
                          </span>
                        </td>
                        <td className='idx-table-td-right'>
                          <span
                            className={candidateRow.week52PC != null
                              ? candidateRow.week52PC >= 0
                                ? 'idx-pct idx-pct-up'
                                : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(candidateRow.week52PC ?? null)}
                          </span>
                        </td>
                        <td className='idx-table-td-right'>
                          {Utils.Format.formatNum(candidateRow.compositePercentile, 0)}
                        </td>
                        <td className='idx-table-td-right'>
                          {candidateRow.newsSentimentScore != null &&
                              (candidateRow.newsSentimentCount ?? 0) > 0
                            ? (
                              <span
                                title={candidateRow.newsSentimentLabel ?? ''}
                                className={`idx-sentiment-pill ${
                                  candidateRow.newsSentimentScore! > 0
                                    ? 'idx-sentiment-pos'
                                    : candidateRow.newsSentimentScore! < 0
                                    ? 'idx-sentiment-neg'
                                    : 'idx-sentiment-neutral'
                                }`}
                              >
                                {Utils.Format.formatNum(candidateRow.newsSentimentScore!, 2)}
                              </span>
                            )
                            : <span className='idx-muted'>N/A</span>}
                        </td>
                      </>
                    )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className='idx-pagination'>
        <span className='idx-pagination-info'>
          {totalCount === 0
            ? 'No Data'
            : `Rows ${fromRow}-${toRow} of ${totalCount.toLocaleString('id-ID')}`}
          {totalCountLabel != null && ` (${totalCountLabel})`}
        </span>
        <div className='idx-pagination-actions'>
          <button
            type='button'
            className='idx-btn'
            onClick={() => onPage(Math.max(0, offset - limit))}
            disabled={!hasPrevPage}
            aria-label='Previous Page'
          >
            <ChevronLeft size={16} aria-hidden />
            <span>Previous</span>
          </button>
          <button
            type='button'
            className='idx-btn'
            onClick={() => onPage(offset + limit)}
            disabled={!hasNextPage}
            aria-label='Next Page'
          >
            <span>Next</span>
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
