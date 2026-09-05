/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'

export type PredictionStatus = 'open' | 'won' | 'lost' | 'expired'

const CLASS_BY_STATUS: Record<PredictionStatus, string> = {
  open: 'idx-badge idx-badge-neutral',
  won: 'idx-badge idx-badge-up',
  lost: 'idx-badge idx-badge-down',
  expired: 'idx-badge idx-badge-neutral'
}

export default function StatusBadge({ status }: { status: string }) {
  const normalized = (['open', 'won', 'lost', 'expired'].includes(status)
    ? status
    : 'open') as PredictionStatus
  return <span className={CLASS_BY_STATUS[normalized]}>{normalized}</span>
}
