/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, BrainCircuit, History as HistoryIcon, Layers, LineChart, Target, Trophy } from 'lucide-react'
import * as Hooks from '@app/pages/hooks/index.ts'
import * as Utils from '@app/pages/utils/index.ts'
import KpiCard from '@app/pages/components/common/KpiCard.tsx'
import PageHeader from '@app/pages/components/common/PageHeader.tsx'
import StatusBadge from '@app/pages/components/common/StatusBadge.tsx'
import ForexDetailDrawer from '@app/pages/components/common/ForexDetailDrawer.tsx'
import * as ScreenerComps from '@app/pages/components/screener/index.ts'
import { usePredictionStats, usePredictions } from '@app/pages/hooks/usePredictions.ts'
import { useInstruments } from '@app/pages/hooks/useInstruments.ts'
import type * as Types from '@app/pages/Types.ts'

const overviewParams: Types.CandidatesParams = {
  limit: 10,
  offset: 0,
  setup: 'fundamental',
  defaultFilter: true,
  exchange: 'IDX',
  requireNewsSentiment: false,
  withSectorRank: true
}

export default function Home() {
  const navigate = useNavigate()
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null)
  const [detailAssetClass, setDetailAssetClass] =
    useState<Types.PredictionAssetClass>('forex')
  const { data: generalData } = Hooks.useGeneral()
  const { response: candidatesResponse, loading: candidatesLoading } =
    Hooks.useCandidates(overviewParams)
  const { data: sectorData } = Hooks.useSectorStrength(4)
  const { data: statsData, loading: statsLoading } = usePredictionStats()
  const { data: recentPredictions, loading: recentLoading } = usePredictions({ limit: 6 })
  const { data: instruments } = useInstruments()

  const candidateCount = candidatesResponse?.totalCount ?? 0
  const sectorCount = generalData?.sectors.length ?? 0
  const predictionCount = statsData?.counts.total ?? 0
  const winRate = statsData?.overall.winRate
  const topSector = sectorData != null && sectorData.length > 0 ? sectorData[0] : null

  return (
    <div>
      <PageHeader
        title='Market Overview'
        subtitle='IDX equities, metals, and major forex pairs in one dashboard.'
      />
      <div className='idx-kpi-strip'>
        <KpiCard
          label='Candidates'
          value={candidatesLoading ? '…' : Utils.Format.formatNum(candidateCount, 0)}
          icon={BarChart3}
        />
        <KpiCard
          label='Sectors'
          value={Utils.Format.formatNum(sectorCount, 0)}
          icon={Layers}
        />
        <KpiCard
          label='Predictions Tracked'
          value={statsLoading ? '…' : Utils.Format.formatNum(predictionCount, 0)}
          icon={Target}
        />
        <KpiCard
          label='Win Rate'
          value={winRate != null ? `${winRate.toFixed(1)}%` : '—'}
          icon={Trophy}
          delta={winRate != null ? 'settled predictions' : 'no settled predictions yet'}
        />
        <KpiCard
          label='Top Sector'
          value={topSector != null ? topSector.sector : '—'}
          icon={LineChart}
          delta={topSector != null ? Utils.Format.formatPct(topSector.avgMomentum) : undefined}
          deltaDirection={
            topSector != null && topSector.avgMomentum >= 0 ? 'up' : 'down'
          }
        />
      </div>

      <div className='idx-grid-main'>
        <div>
          <section className='idx-card idx-mb-24'>
            <div className='idx-card-title idx-card-title-with-icon'>
              <BarChart3 size={18} aria-hidden />
              <span>Top Candidates</span>
            </div>
            <div className='idx-overview-movers'>
              {(candidatesResponse?.data ?? []).slice(0, 10).map((row) => (
                <Link
                  key={row.code}
                  to='/screener'
                  className='idx-overview-mover'
                  title='Open in screener'
                >
                  <span className='idx-overview-mover-code'>{row.code}</span>
                  <span className='idx-overview-mover-name'>
                    {row.name != null && row.name !== '' ? row.name : row.sector ?? '—'}
                  </span>
                  {row.price != null && (
                    <span className='idx-overview-mover-price'>
                      {Utils.Format.formatNum(row.price, 0)}
                    </span>
                  )}
                  <span
                    className={`idx-pct ${
                      (row.changePct ?? 0) >= 0 ? 'idx-pct-up' : 'idx-pct-down'
                    }`}
                  >
                    {Utils.Format.formatPct(row.changePct)}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className='idx-card'>
            <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
              <HistoryIcon size={18} aria-hidden />
              <span>Recent Predictions</span>
              <Link to='/history' className='idx-link idx-card-title-action'>
                View history
              </Link>
            </div>
            {(recentPredictions ?? []).length === 0 && !recentLoading && (
              <p className='idx-p-muted'>
                No predictions yet — create one in the{' '}
                <Link to='/prediction' className='idx-link'>
                  Prediction Lab
                </Link>
                .
              </p>
            )}
            {(recentPredictions ?? []).map((prediction) => (
              <div key={prediction.id} className='idx-overview-prediction'>
                <span className='idx-overview-prediction-symbol'>{prediction.symbol}</span>
                <span className='idx-overview-prediction-strategy'>{prediction.strategy}</span>
                <span className='idx-overview-prediction-probability'>
                  {Utils.Format.formatPct(prediction.bullishProbability)}
                </span>
                <StatusBadge status={prediction.status} />
              </div>
            ))}
          </section>
        </div>

        <aside>
          <ScreenerComps.SectorStrength
            data={sectorData}
            loading={false}
            week={4}
            onWeekChange={() => undefined}
          />
          <section className='idx-card idx-mt-24'>
            <div className='idx-card-title idx-card-title-with-icon'>
              <BrainCircuit size={18} aria-hidden />
              <span>Forex & Metals</span>
            </div>
            <div className='idx-overview-instruments'>
              {instruments.map((instrument) => (
                <button
                  key={instrument.symbol}
                  type='button'
                  className='idx-overview-instrument'
                  onClick={() => {
                    setDetailSymbol(instrument.symbol)
                    setDetailAssetClass(instrument.assetClass)
                  }}
                >
                  <span className='idx-overview-instrument-symbol'>{instrument.symbol}</span>
                  <span className='idx-overview-instrument-price'>
                    {Utils.Format.formatPrice(instrument.latestPrice, instrument.assetClass)}
                  </span>
                  <span
                    className={`idx-pct ${
                      (instrument.dayChangePct ?? 0) >= 0 ? 'idx-pct-up' : 'idx-pct-down'
                    }`}
                  >
                    {Utils.Format.formatPct(instrument.dayChangePct)}
                  </span>
                </button>
              ))}
            </div>
            <Link to='/markets' className='idx-link idx-overview-markets-link'>
              Bid/offer market aggregates →
            </Link>
          </section>
        </aside>
      </div>
      {detailSymbol != null && (
        <ForexDetailDrawer
          symbol={detailSymbol}
          assetClass={detailAssetClass}
          onClose={() => setDetailSymbol(null)}
          onRunPrediction={() =>
            navigate(`/prediction?symbol=${encodeURIComponent(detailSymbol)}`)
          }
        />
      )}
    </div>
  )
}
