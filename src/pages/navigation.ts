/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BrainCircuit,
  CandlestickChart,
  Gauge,
  History,
  LineChart,
  Star
} from 'lucide-react'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  /** Exact match (used for the root path so `/` does not match every route). */
  exact?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/', icon: Gauge, exact: true },
  { label: 'Screener', path: '/screener', icon: BarChart3 },
  { label: 'Prediction Lab', path: '/prediction', icon: LineChart },
  { label: 'AI Analyst', path: '/analyst', icon: BrainCircuit },
  { label: 'History', path: '/history', icon: History },
  { label: 'Watchlist', path: '/watchlist', icon: Star },
  { label: 'Markets', path: '/markets', icon: CandlestickChart }
]
