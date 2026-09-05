/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Star } from 'lucide-react'
import * as Hooks from '@app/pages/hooks/index.ts'
import PageHeader from '@app/pages/components/common/PageHeader.tsx'
import EmptyState from '@app/pages/components/common/EmptyState.tsx'
import * as ScreenerComps from '@app/pages/components/screener/index.ts'
import type * as Types from '@app/pages/Types.ts'

export default function Watchlist() {
  const { watchlistRows, watchlistCodes, toggleWatchlist, replaceRow } = Hooks.useWatchlist()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefreshAll = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all(
        watchlistRows.map(async (row) => {
          try {
            const response = await Hooks.fetchApi<Types.CandidatesResponse>(
              '/api/candidates',
              { search: row.code, includeRejected: true, limit: 1, withSectorRank: true }
            )
            const fresh = response.data.find((candidate) => candidate.code === row.code)
            if (fresh != null) {
              replaceRow(fresh as Types.CandidateTableRow)
            }
          } catch {
            // keep the stored snapshot when a refresh fails
          }
        })
      )
    } finally {
      setRefreshing(false)
    }
  }, [watchlistRows, replaceRow])

  return (
    <div>
      <PageHeader
        title='Watchlist'
        subtitle='Starred candidates — stored locally in this browser.'
        actions={
          watchlistRows.length > 0 ? (
            <button
              type='button'
              className='idx-btn'
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw size={16} aria-hidden />
              <span>{refreshing ? 'Refreshing…' : 'Refresh All'}</span>
            </button>
          ) : undefined
        }
      />
      {watchlistRows.length === 0 ? (
        <EmptyState
          icon={Star}
          title='Your watchlist is empty'
          message='Use the star icon in the screener table to track candidates here.'
          action={
            <Link to='/screener' className='idx-btn idx-btn-primary'>
              Open Screener
            </Link>
          }
        />
      ) : (
        <div className='idx-card idx-table-wrap'>
          <ScreenerComps.CandidatesTable
            data={watchlistRows}
            limit={watchlistRows.length || 10}
            offset={0}
            totalCount={watchlistRows.length}
            onPage={() => undefined}
            onRowClick={() => undefined}
            setup='fundamental'
            loading={false}
            error={null}
            emptyMessage='No watchlist entries yet.'
            watchlistCodes={watchlistCodes}
            onWatchlistToggle={toggleWatchlist}
          />
        </div>
      )}
    </div>
  )
}
