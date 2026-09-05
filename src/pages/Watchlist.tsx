/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { Star } from 'lucide-react'
import EmptyState from '@app/pages/components/common/EmptyState.tsx'

export default function Watchlist() {
  return (
    <EmptyState
      icon={Star}
      title='Watchlist'
      message='Star candidates from the screener to track them here.'
    />
  )
}
