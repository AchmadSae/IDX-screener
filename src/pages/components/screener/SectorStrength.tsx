/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useMemo } from 'react'
import { Layers } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import * as Utils from '@app/pages/utils/index.ts'
import { CATEGORICAL_PALETTE, CHART_MUTED } from '@app/pages/theme/colors.ts'
import type * as Types from '@app/pages/Types.ts'

export const sectorPalette = CATEGORICAL_PALETTE

export default function SectorStrength({
  data,
  loading,
  week,
  onWeekChange
}: Types.SectorStrengthProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }
    return data
      .filter((sectorRow) => sectorRow.count > 0)
      .map((sectorRow, index) => ({
        sector: sectorRow.sector,
        count: sectorRow.count,
        avgMomentum: sectorRow.avgMomentum,
        fill: sectorPalette[index % sectorPalette.length]
      }))
  }, [data])

  return (
    <div className='idx-card idx-sector-card'>
      <div className='idx-sector-header'>
        <h3 className='idx-card-title idx-card-title-with-icon'>
          <Layers size={20} aria-hidden />
          <span>Kekuatan Sektor</span>
        </h3>
        <div className='idx-tabs'>
          <button
            type='button'
            className={`idx-tab ${week === 1 ? 'idx-tab-active' : ''}`}
            onClick={() => onWeekChange(1)}
          >
            1w
          </button>
          <button
            type='button'
            className={`idx-tab ${week === 4 ? 'idx-tab-active' : ''}`}
            onClick={() => onWeekChange(4)}
          >
            4w
          </button>
          <button
            type='button'
            className={`idx-tab ${week === 13 ? 'idx-tab-active' : ''}`}
            onClick={() => onWeekChange(13)}
          >
            13w
          </button>
          <button
            type='button'
            className={`idx-tab ${week === 26 ? 'idx-tab-active' : ''}`}
            onClick={() => onWeekChange(26)}
          >
            26w
          </button>
        </div>
      </div>
      {loading && <div className='idx-loading'>Memuat...</div>}
      {!loading && data && data.length === 0 && (
        <p className='idx-p-muted idx-py-16'>Tidak ada data sektor.</p>
      )}
      {!loading && data && data.length > 0 && (
        <>
          <div className='idx-sector-chart-wrap'>
            <ResponsiveContainer width='100%' height={260}>
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={chartData}
                  dataKey='count'
                  nameKey='sector'
                  cx='50%'
                  cy='50%'
                  innerRadius='50%'
                  outerRadius='80%'
                  paddingAngle={1}
                  isAnimationActive={false}
                >
                  {chartData.map((pieSegment) => (
                    <Cell key={pieSegment.sector} fill={pieSegment.fill ?? CHART_MUTED} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(
                    cellValue: unknown,
                    _name: unknown,
                    tooltipItem: { payload?: Types.SectorStrengthTooltipPayload }
                  ) => {
                    const payload = tooltipItem?.payload
                    const count = typeof cellValue === 'number' ? cellValue : 0
                    const sector = payload?.sector ?? ''
                    const avgMomentum = payload?.avgMomentum ?? 0
                    return [
                      `${Utils.Format.formatTitleCase(sector)}: ${
                        Utils.Format.formatPct(
                          avgMomentum
                        )
                      } (${count} ${Utils.Format.formatTitleCase('emiten')})`,
                      ''
                    ]
                  }}
                  contentStyle={{
                    background: 'var(--idx-deep)',
                    color: 'white',
                    borderRadius: 12,
                    fontSize: 11
                  }}
                />
                <Legend
                  layout='vertical'
                  align='right'
                  verticalAlign='middle'
                  formatter={(legendLabel) => legendLabel}
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className='idx-sector-list'>
            {data
              .filter((sectorRow) => sectorRow.count > 0)
              .map((sectorRow) => {
                const isUp = sectorRow.avgMomentum >= 0
                const isDown = sectorRow.avgMomentum < 0
                const rowClassName = isUp
                  ? 'idx-sector-up'
                  : isDown
                  ? 'idx-sector-down'
                  : 'idx-sector-neutral'
                return (
                  <li key={sectorRow.sector} className={`idx-sector-item ${rowClassName}`}>
                    <span>{sectorRow.sector}</span>
                    <span className='idx-sector-pct'>
                      {Utils.Format.formatPct(sectorRow.avgMomentum)}
                    </span>
                  </li>
                )
              })}
          </ul>
        </>
      )}
    </div>
  )
}
