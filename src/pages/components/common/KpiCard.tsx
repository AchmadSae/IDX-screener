/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type KpiCardProps = {
  label: string
  value: string
  delta?: string
  /** Delta direction drives the color; neutral when omitted. */
  deltaDirection?: 'up' | 'down'
  icon?: LucideIcon
}

export default function KpiCard({ label, value, delta, deltaDirection, icon: Icon }: KpiCardProps) {
  return (
    <div className='idx-stat-card idx-kpi-card'>
      <div className='idx-kpi-card-top'>
        <span className='idx-stat-card-label'>{label}</span>
        {Icon != null && <Icon size={16} className='idx-kpi-card-icon' aria-hidden />}
      </div>
      <div className='idx-stat-card-value'>{value}</div>
      {delta != null && (
        <div
          className={`idx-kpi-card-delta ${
            deltaDirection === 'up'
              ? 'idx-kpi-card-delta-up'
              : deltaDirection === 'down'
              ? 'idx-kpi-card-delta-down'
              : ''
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  )
}
