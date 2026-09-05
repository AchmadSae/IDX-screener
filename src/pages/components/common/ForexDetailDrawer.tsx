/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useMemo } from 'react'
import { CandlestickChart } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import * as Utils from '@app/pages/utils/index.ts'
import Drawer from '@app/pages/components/drawer/Drawer.tsx'
import { CHART_DOWN, CHART_UP, chartTheme } from '@app/pages/theme/colors.ts'
import { useForexOhlc } from '@app/pages/hooks/useForexOhlc.ts'
import type * as Types from '@app/pages/Types.ts'

export type ForexDetailDrawerProps = {
  symbol: string
  assetClass: Types.PredictionAssetClass
  onClose: () => void
  onRunPrediction: () => void
}

export default function ForexDetailDrawer({
  symbol,
  assetClass,
  onClose,
  onRunPrediction
}: ForexDetailDrawerProps) {
  const { data, loading, error } = useForexOhlc(symbol, 90)

  const chartData = useMemo(() => {
    if (data == null) {
      return []
    }
    return data.dateInt.map((dateInt, index) => ({
      date: Utils.Format.formatDateInt(dateInt),
      close: data.priceClose[index] ?? 0,
      change: (data.priceClose[index] ?? 0) - (data.priceClose[index - 1] ?? data.priceClose[index] ?? 0)
    }))
  }, [data])

  const latest = data != null && data.priceClose.length > 0
    ? data.priceClose[data.priceClose.length - 1]!
    : null
  const previous = data != null && data.priceClose.length > 1
    ? data.priceClose[data.priceClose.length - 2]!
    : null
  const dayChangePct =
    latest != null && previous != null && previous > 0
      ? ((latest - previous) / previous) * 100
      : null
  const chartUp = (dayChangePct ?? 0) >= 0

  return (
    <Drawer
      title={
        <>
          <CandlestickChart size={22} aria-hidden />
          <span>{symbol}</span>
        </>
      }
      onClose={onClose}
      width={640}
      closeLabel='Close chart'
    >
      {loading && <div className='idx-loading'>Loading market data…</div>}
      {error != null && <div className='idx-error'>{error}</div>}
      {data != null && !loading && (
        <>
          <div className='idx-forex-stats'>
            <div className='idx-prediction-metric'>
              <span className='idx-prediction-metric-label'>Last Price</span>
              <span className='idx-prediction-metric-value'>
                {Utils.Format.formatPrice(latest, assetClass)}
              </span>
            </div>
            <div className='idx-prediction-metric'>
              <span className='idx-prediction-metric-label'>Day Change</span>
              <span
                className={`idx-prediction-metric-value ${
                  chartUp ? 'idx-pct-up' : 'idx-pct-down'
                }`}
              >
                {Utils.Format.formatPct(dayChangePct)}
              </span>
            </div>
            <div className='idx-prediction-metric'>
              <span className='idx-prediction-metric-label'>Data Date</span>
              <span className='idx-prediction-metric-value idx-forex-date'>
                {data.dateInt.length > 0
                  ? Utils.Format.formatDateInt(data.dateInt[data.dateInt.length - 1]!)
                  : '—'}
              </span>
            </div>
          </div>
          <div className='idx-forex-chart'>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey='date'
                  tick={chartTheme.tick}
                  axisLine={{ stroke: 'var(--idx-border)' }}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={chartTheme.tick}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip {...chartTheme.tooltip} />
                <Area
                  type='monotone'
                  dataKey='close'
                  stroke={chartUp ? CHART_UP : CHART_DOWN}
                  fill={chartUp ? CHART_UP : CHART_DOWN}
                  fillOpacity={0.12}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className='idx-forex-actions'>
            <button type='button' className='idx-btn idx-btn-primary' onClick={onRunPrediction}>
              Predict {symbol}
            </button>
          </div>
          <p className='idx-p-muted idx-mt-16'>
            Daily bars from Yahoo Finance (no API key). The last 90 trading days are shown.
          </p>
        </>
      )}
    </Drawer>
  )
}
