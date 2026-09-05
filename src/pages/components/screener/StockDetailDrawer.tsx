/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useMemo, useState } from 'react'
import { BarChart2, LineChart as LineChartIcon, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import * as Hooks from '@app/pages/hooks/index.ts'
import * as Utils from '@app/pages/utils/index.ts'
import { CHART_DOWN, CHART_UP } from '@app/pages/theme/colors.ts'
import type * as Types from '@app/pages/Types.ts'
import Drawer from '@app/pages/components/drawer/Drawer.tsx'
import TradeAdvisor from '@app/pages/components/screener/TradeAdvisor.tsx'

const foreignPeriodOptions: Types.ForeignPeriodOption[] = [
  { days: 30, label: '1 mo' },
  { days: 60, label: '2 mo' },
  { days: 90, label: '3 mo' },
  { days: 180, label: '6 mo' },
  { days: 360, label: '1 yr' }
]

function buildRsiChartData(rsiData: Types.RsiResponse | null): {
  chartData: Types.RsiChartPoint[]
  hasSector: boolean
} {
  if (!rsiData?.data?.length) {
    return { chartData: [], hasSector: false }
  }
  const byDate = new Map<string, Types.RsiChartPoint>()
  for (const row of rsiData.data) {
    const dateStr = Utils.Format.formatDateInt(row.date)
    byDate.set(dateStr, {
      date: dateStr,
      rsi: row.rsi ?? 0,
      sectorRsi: null
    })
  }
  if (rsiData.sectorData?.length) {
    for (const row of rsiData.sectorData) {
      const dateStr = Utils.Format.formatDateInt(row.date)
      const existing = byDate.get(dateStr)
      const sectorVal = row.rsi != null && Number.isFinite(row.rsi) ? row.rsi : null
      if (existing) {
        existing.sectorRsi = sectorVal
      } else {
        byDate.set(dateStr, { date: dateStr, rsi: 0, sectorRsi: sectorVal })
      }
    }
  }
  const chartData = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date, 'en'))
  const hasSector = chartData.some((d) => d.sectorRsi != null)
  return { chartData, hasSector }
}

export default function StockDetailDrawer({
  detail,
  loading,
  error,
  onClose
}: Types.StockDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Types.DetailTab>('fundamental')
  const [foreignPeriodDays, setForeignPeriodDays] = useState<Types.ForeignPeriodDays>(90)
  const {
    data: rsiData,
    loading: rsiLoading,
    error: rsiError
  } = Hooks.useRSI(detail?.code ?? null, foreignPeriodDays)
  const {
    data: ohlcData,
    loading: ohlcLoading,
    error: ohlcError
  } = Hooks.useOHLC(detail?.code ?? null, foreignPeriodDays)
  const {
    data: foreignData,
    loading: foreignLoading,
    error: foreignError
  } = Hooks.useForeign(detail?.code ?? null, foreignPeriodDays)
  const chartData = detail?.ohlc?.map((ohlcRow: Types.StockDetailOhlcRow) => ({
    date: Utils.Format.formatDateInt(ohlcRow.date),
    close: ohlcRow.close ?? 0
  })) ?? []
  const yDomain = useMemo((): [number, number] | undefined => {
    if (chartData.length === 0) {
      return undefined
    }
    const closes = chartData
      .map((chartPoint: Types.PriceLinePoint) => chartPoint.close)
      .filter((closePrice: number) => closePrice > 0)
    if (closes.length === 0) {
      return undefined
    }
    const minClose = Math.min(...closes)
    const maxClose = Math.max(...closes)
    return [Math.max(minClose, 1), maxClose]
  }, [chartData])

  const rsiChartData = useMemo(() => buildRsiChartData(rsiData ?? null), [rsiData])

  return (
    <Drawer
      title={
        <>
          <LineChartIcon size={22} aria-hidden />
          <span>{detail ? `${detail.code}: ${detail.name ?? ''}` : 'Stock Detail'}</span>
        </>
      }
      onClose={onClose}
      width={720}
      closeLabel='Close drawer'
    >
      <div className='idx-modal-body'>
          {loading && <div className='idx-loading'>Loading...</div>}
          {error && <div className='idx-error'>{error}</div>}
          {detail && !loading && (
            <>
              <div className='idx-tabs idx-mb-16'>
                <button
                  type='button'
                  className={`idx-tab idx-tab-inline ${
                    activeTab === 'fundamental' ? 'idx-tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('fundamental')}
                >
                  <BarChart2 size={16} aria-hidden />
                  <span>Fundamental</span>
                </button>
                <button
                  type='button'
                  className={`idx-tab idx-tab-inline ${
                    activeTab === 'technical' ? 'idx-tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('technical')}
                >
                  <TrendingUp size={16} aria-hidden />
                  <span>Technical</span>
                </button>
              </div>
              {activeTab === 'fundamental' && (
                <>
                  <div className='idx-detail-sections'>
                    <section className='idx-detail-section'>
                      <h4 className='idx-detail-section-title'>Classification</h4>
                      <div className='idx-detail-grid'>
                        <div className='idx-detail-item idx-detail-item-full'>
                          <label>Sector / Industry</label>
                          <span>{[detail.sector ?? '-', detail.industry ?? '-'].join(' / ')}</span>
                        </div>
                      </div>
                    </section>
                    <section className='idx-detail-section'>
                      <h4 className='idx-detail-section-title'>Valuation</h4>
                      <div className='idx-detail-grid'>
                        <div className='idx-detail-item'>
                          <label>PER</label>
                          <span>{Utils.Format.formatNum(detail.per, 1)}</span>
                        </div>
                        <div className='idx-detail-item'>
                          <label>PBV</label>
                          <span>{Utils.Format.formatNum(detail.pbv, 1)}</span>
                        </div>
                      </div>
                    </section>
                    <section className='idx-detail-section'>
                      <h4 className='idx-detail-section-title'>Profitability</h4>
                      <div className='idx-detail-grid'>
                        <div className='idx-detail-item'>
                          <label>ROE</label>
                          <span>{Utils.Format.formatNum(detail.roe, 1)}</span>
                        </div>
                        <div className='idx-detail-item'>
                          <label>ROA</label>
                          <span>{Utils.Format.formatNum(detail.roa, 1)}</span>
                        </div>
                      </div>
                    </section>
                    <section className='idx-detail-section'>
                      <h4 className='idx-detail-section-title'>Leverage</h4>
                      <div className='idx-detail-grid'>
                        <div className='idx-detail-item'>
                          <label>DER</label>
                          <span>{Utils.Format.formatNum(detail.der, 1)}</span>
                        </div>
                      </div>
                    </section>
                    <section className='idx-detail-section'>
                      <h4 className='idx-detail-section-title'>Liquidity</h4>
                      <div className='idx-detail-grid'>
                        <div className='idx-detail-item'>
                          <label>Value</label>
                          <span>{Utils.Format.formatRp(detail.value)}</span>
                        </div>
                        <div className='idx-detail-item'>
                          <label>Volume</label>
                          <span>{Utils.Format.formatNum(detail.volume, 0)}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                  <div className='idx-detail-block'>
                    <label className='idx-form-label'>Score</label>
                    <table className='idx-detail-table'>
                      <thead>
                        <tr>
                          <th>Value</th>
                          <th>Quality</th>
                          <th>Momentum</th>
                          <th>Composite</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{Utils.Format.formatNum(detail.valueScore, 3)}</td>
                          <td>{Utils.Format.formatNum(detail.qualityScore, 3)}</td>
                          <td>{Utils.Format.formatNum(detail.momentumScore, 3)}</td>
                          <td className='idx-detail-composite-cell'>
                            {Utils.Format.formatNum(detail.compositeScore, 3)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <TradeAdvisor code={detail.code} detail={detail} />
                  <div className='idx-detail-block'>
                    <label className='idx-form-label'>Momentum</label>
                    <table className='idx-detail-table'>
                      <thead>
                        <tr>
                          <th>4w</th>
                          <th>13w</th>
                          <th>26w</th>
                          <th>52w</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            className={detail.week4PC != null
                              ? detail.week4PC >= 0 ? 'idx-pct idx-pct-up' : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(detail.week4PC ?? null)}
                          </td>
                          <td
                            className={detail.week13PC != null
                              ? detail.week13PC >= 0 ? 'idx-pct idx-pct-up' : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(detail.week13PC ?? null)}
                          </td>
                          <td
                            className={detail.week26PC != null
                              ? detail.week26PC >= 0 ? 'idx-pct idx-pct-up' : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(detail.week26PC ?? null)}
                          </td>
                          <td
                            className={detail.week52PC != null
                              ? detail.week52PC >= 0 ? 'idx-pct idx-pct-up' : 'idx-pct idx-pct-down'
                              : ''}
                          >
                            {Utils.Format.formatPct(detail.week52PC ?? null)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {chartData.length > 0 && (
                    <>
                      <label className='idx-form-label'>Price Movement (Close)</label>
                      <div className='idx-chart-container'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id='detailChartGrad' x1='0' y1='0' x2='0' y2='1'>
                                <stop
                                  offset='5%'
                                  stopColor='var(--idx-primary)'
                                  stopOpacity={0.2}
                                />
                                <stop offset='95%' stopColor='var(--idx-primary)' stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey='date'
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                            />
                            <YAxis
                              orientation='right'
                              scale={yDomain ? 'log' : 'linear'}
                              {...(yDomain !== undefined && { domain: yDomain })}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: 'var(--idx-deep)',
                                color: 'white',
                                borderRadius: 12,
                                fontSize: 12
                              }}
                            />
                            <Area
                              type='monotone'
                              dataKey='close'
                              stroke='var(--idx-primary)'
                              strokeWidth={2}
                              fill='url(#detailChartGrad)'
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </>
              )}
              {activeTab === 'technical' && (
                <>
                  <div className='idx-foreign-header idx-mb-16'>
                    <label className='idx-form-label'>Periode</label>
                    <div className='idx-tabs'>
                      {foreignPeriodOptions.map(({ days, label }) => (
                        <button
                          key={days}
                          type='button'
                          className={`idx-tab idx-tab-inline ${
                            foreignPeriodDays === days ? 'idx-tab-active' : ''
                          }`}
                          onClick={() => setForeignPeriodDays(days)}
                        >
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='idx-detail-block idx-mb-16'>
                    <label className='idx-form-label'>
                      RSI (14)
                      {rsiData?.sector != null && rsiData.sector !== '' && (
                        <span className='idx-text-muted idx-ml-4'>vs Sektor {rsiData.sector}</span>
                      )}
                    </label>
                    {rsiLoading && <div className='idx-loading'>Loading RSI…</div>}
                    {rsiError && <div className='idx-error'>{rsiError}</div>}
                    {!rsiLoading && !rsiError && rsiChartData.chartData.length > 0 && (
                      <div className='idx-chart-container'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <LineChart
                            data={rsiChartData.chartData}
                            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                          >
                            <XAxis
                              dataKey='date'
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              orientation='right'
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (!active || !payload?.length || !label) {
                                  return null
                                }
                                const p = payload[0]?.payload
                                if (p == null) {
                                  return null
                                }
                                return (
                                  <div className='idx-foreign-tooltip'>
                                    <div className='idx-foreign-tooltip-label'>
                                      {Utils.Format.formatTitleCase(String(label))}
                                    </div>
                                    <div className='idx-tooltip-row'>
                                      <span className='idx-tooltip-swatch idx-tooltip-swatch-stock' />
                                      <span>
                                        {Utils.Format.formatTitleCase('RSI (stock)')}:{' '}
                                        {Utils.Format.formatNum(p.rsi, 2)}
                                      </span>
                                    </div>
                                    {p.sectorRsi != null && (
                                      <div className='idx-tooltip-row'>
                                        <span className='idx-tooltip-swatch idx-tooltip-swatch-sector' />
                                        <span>
                                          {Utils.Format.formatTitleCase('RSI sektor (rata)')}:{' '}
                                          {Utils.Format.formatNum(p.sectorRsi, 2)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              }}
                            />
                            <ReferenceLine
                              y={30}
                              stroke='var(--idx-text-muted)'
                              strokeDasharray='2 2'
                            />
                            <ReferenceLine
                              y={70}
                              stroke='var(--idx-text-muted)'
                              strokeDasharray='2 2'
                            />
                            <Line
                              type='monotone'
                              dataKey='rsi'
                              name='Issuers'
                              stroke='var(--idx-primary)'
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                            {rsiChartData.hasSector && (
                              <Line
                                type='monotone'
                                dataKey='sectorRsi'
                                name='Sektor'
                                stroke='var(--idx-text-secondary)'
                                strokeWidth={1.5}
                                strokeDasharray='4 2'
                                dot={false}
                                isAnimationActive={false}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {!rsiLoading && !rsiError && rsiData && rsiData.data.length === 0 && (
                      <p className='idx-p-muted'>No RSI data for this period.</p>
                    )}
                  </div>
                  <div className='idx-detail-block idx-mb-16'>
                    <label className='idx-form-label'>Volume (Bid vs Offer)</label>
                    {ohlcLoading && <div className='idx-loading'>Loading volume…</div>}
                    {ohlcError && <div className='idx-error'>{ohlcError}</div>}
                    {!ohlcLoading && !ohlcError && ohlcData && ohlcData.length > 0 && (
                      <div className='idx-chart-container'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <BarChart
                            data={ohlcData.map((row) => ({
                              date: Utils.Format.formatDateInt(row.date),
                              bidVolume: row.bidVolume ?? 0,
                              offerVolume: row.offerVolume ?? 0
                            }))}
                            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                          >
                            <XAxis
                              dataKey='date'
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                            />
                            <YAxis
                              orientation='right'
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                              tickFormatter={(v) => Utils.Format.formatNum(v, 0)}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (!active || !payload?.length || !label) {
                                  return null
                                }
                                const row = payload[0]?.payload
                                if (row == null) {
                                  return null
                                }
                                const bid = row.bidVolume ?? 0
                                const offer = row.offerVolume ?? 0
                                return (
                                  <div className='idx-foreign-tooltip'>
                                    <div className='idx-foreign-tooltip-label'>
                                      {Utils.Format.formatTitleCase(String(label))}
                                    </div>
                                    <div className='idx-tooltip-row'>
                                      <span className='idx-tooltip-swatch idx-tooltip-swatch-up' />
                                      <span>
                                        {Utils.Format.formatTitleCase('Bid')}:{' '}
                                        {Utils.Format.formatNum(bid, 0)}
                                      </span>
                                    </div>
                                    <div className='idx-tooltip-row'>
                                      <span className='idx-tooltip-swatch idx-tooltip-swatch-down' />
                                      <span>
                                        {Utils.Format.formatTitleCase('Offer')}:{' '}
                                        {Utils.Format.formatNum(offer, 0)}
                                      </span>
                                    </div>
                                    <div>
                                      {Utils.Format.formatTitleCase('Total')}:{' '}
                                      {Utils.Format.formatNum(bid + offer, 0)}
                                    </div>
                                  </div>
                                )
                              }}
                            />
                            <Bar
                              dataKey='bidVolume'
                              name='Bid'
                              stackId='vol'
                              fill='var(--idx-up)'
                              isAnimationActive={false}
                            />
                            <Bar
                              dataKey='offerVolume'
                              name='Offer'
                              stackId='vol'
                              fill='var(--idx-down)'
                              radius={[4, 4, 0, 0]}
                              isAnimationActive={false}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {!ohlcLoading && !ohlcError && ohlcData && ohlcData.length === 0 && (
                      <p className='idx-p-muted'>No volume data for this period.</p>
                    )}
                  </div>
                  <div className='idx-detail-block idx-mb-12'>
                    <label className='idx-form-label'>Foreign Flow (Net)</label>
                    {foreignLoading && <div className='idx-loading'>Loading foreign flow…</div>}
                    {foreignError && <div className='idx-error'>{foreignError}</div>}
                    {!foreignLoading && !foreignError && foreignData && (
                      <>
                        {foreignData.summary.dayCount > 0 && (
                          <p className='idx-p-muted idx-mb-8'>
                            Total NET Flow Dalam {foreignData.summary.dayCount} Hari:{' '}
                            <span
                              className={foreignData.summary.totalNet >= 0
                                ? 'idx-pct idx-pct-up'
                                : 'idx-pct idx-pct-down'}
                            >
                              {Utils.Format.formatRp(foreignData.summary.totalNet)}
                            </span>
                          </p>
                        )}
                        {foreignData.data.length > 0
                          ? (
                            <div className='idx-chart-container'>
                              <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                  data={foreignData.data.map((row) => ({
                                    date: Utils.Format.formatDateInt(row.date),
                                    buy: row.buy ?? 0,
                                    sell: row.sell ?? 0,
                                    net: row.net ?? 0
                                  }))}
                                  margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                >
                                  <XAxis
                                    dataKey='date'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                                  />
                                  <YAxis
                                    orientation='right'
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--idx-text-muted)', fontSize: 10 }}
                                    tickFormatter={(v) => Utils.Format.formatRp(v)}
                                  />
                                  <Tooltip
                                    content={({ active, payload, label }) => {
                                      if (!active || !payload?.length || !label) {
                                        return null
                                      }
                                      const row = payload[0]?.payload
                                      if (row == null) {
                                        return null
                                      }
                                      return (
                                        <div className='idx-foreign-tooltip'>
                                          <div className='idx-foreign-tooltip-label'>
                                            {Utils.Format.formatTitleCase(String(label))}
                                          </div>
                                          <div>
                                            {Utils.Format.formatTitleCase('Buy')}:{' '}
                                            {Utils.Format.formatRp(row.buy)}
                                          </div>
                                          <div>
                                            {Utils.Format.formatTitleCase('Sell')}:{' '}
                                            {Utils.Format.formatRp(row.sell)}
                                          </div>
                                          <div>
                                            {Utils.Format.formatTitleCase('Net')}:{' '}
                                            <span
                                              style={{
                                                color: (row.net ?? 0) >= 0 ? CHART_UP : CHART_DOWN
                                              }}
                                            >
                                              {Utils.Format.formatRp(row.net)}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    }}
                                  />
                                  <Bar
                                    dataKey='net'
                                    radius={[4, 4, 0, 0]}
                                    isAnimationActive={false}
                                  >
                                    {foreignData.data.map((row) => (
                                      <Cell
                                        key={row.date}
                                        fill={(row.net ?? 0) >= 0
                                          ? 'var(--idx-up)'
                                          : 'var(--idx-down)'}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )
                          : <p className='idx-p-muted'>No data for this period.</p>}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
      </div>
    </Drawer>
  )
}
