/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import type { LucideIcon } from 'lucide-react'

export type EmptyStateProps = {
  icon: LucideIcon
  title: string
  message: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className='idx-empty-state'>
      <Icon size={32} className='idx-empty-state-icon' aria-hidden />
      <h3 className='idx-empty-state-title'>{title}</h3>
      <p className='idx-empty-state-message'>{message}</p>
      {action != null && <div className='idx-empty-state-action'>{action}</div>}
    </div>
  )
}
