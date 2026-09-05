/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Chart/palette colors as TS constants. SVG/Recharts fills cannot always read
 * CSS variables, so the semantic chart colors live here — keep them in sync
 * with the tokens in styles/variables.css.
 */

import type { CSSProperties } from 'react'

export const CHART_UP = '#10B981'
export const CHART_DOWN = '#F6465D'
export const CHART_ACCENT = '#4F8CFF'
export const CHART_MUTED = '#67748F'

/** 12-hue categorical palette tuned for a dark navy canvas. */
export const CATEGORICAL_PALETTE = [
  '#4F8CFF',
  '#10B981',
  '#F0B90B',
  '#F6465D',
  '#A78BFA',
  '#F97316',
  '#22D3EE',
  '#EC4899',
  '#84CC16',
  '#E879F9',
  '#2DD4BF',
  '#93C5FD'
]

/** Shared Recharts props so tooltips/axes read as one system. */
export const chartTheme = {
  tooltip: {
    contentStyle: {
      background: 'var(--idx-surface-2)',
      border: '1px solid var(--idx-border)',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(4, 8, 18, 0.45)',
      fontSize: '12px'
    } as CSSProperties,
    labelStyle: { color: 'var(--idx-text-secondary)' } as CSSProperties,
    itemStyle: { color: 'var(--idx-text)' } as CSSProperties,
    cursor: { stroke: 'var(--idx-chart-cursor)' }
  },
  grid: { stroke: 'var(--idx-chart-grid)' },
  tick: { fill: 'var(--idx-text-muted)', fontSize: 11 }
}
