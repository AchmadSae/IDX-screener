/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { BrainCircuit } from 'lucide-react'
import EmptyState from '@app/pages/components/common/EmptyState.tsx'

export default function Analyst() {
  return (
    <EmptyState
      icon={BrainCircuit}
      title='AI Analyst'
      message='Run DeepSeek-assisted analysis for any instrument and review past AI runs.'
    />
  )
}
