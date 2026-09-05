/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { History as HistoryIcon } from 'lucide-react'
import EmptyState from '@app/pages/components/common/EmptyState.tsx'

export default function History() {
  return (
    <EmptyState
      icon={HistoryIcon}
      title='Prediction History'
      message='Filterable history with win rate, average return, and drawdown statistics.'
    />
  )
}
