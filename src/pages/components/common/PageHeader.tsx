/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'

export type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className='idx-page-header'>
      <div>
        <h2 className='idx-page-header-title'>{title}</h2>
        {subtitle != null && <p className='idx-page-header-subtitle'>{subtitle}</p>}
      </div>
      {actions != null && <div className='idx-page-header-actions'>{actions}</div>}
    </div>
  )
}
