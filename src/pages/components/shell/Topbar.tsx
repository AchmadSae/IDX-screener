/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@app/pages/navigation.ts'

/** Jakarta market-status chip: IDX sessions I & II on weekdays. */
function useIdxMarketStatus(): 'open' | 'closed' {
  const [status, setStatus] = useState<'open' | 'closed'>('closed')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(now)
      const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
      const weekday = byType['weekday']
      const hour = Number(byType['hour'])
      const minute = Number(byType['minute'])
      const minutes = hour * 60 + minute
      const weekdayOpen =
        weekday !== 'Sat' && weekday !== 'Sun' &&
        ((minutes >= 9 * 60 && minutes <= 11 * 60 + 30) ||
          (minutes >= 13 * 60 + 30 && minutes <= 15 * 60 + 50))
      setStatus(weekdayOpen ? 'open' : 'closed')
    }
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])
  return status
}

export type TopbarProps = {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation()
  const current = NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )
  const title = current?.label ?? 'IDX + Forex AI Screener'
  const marketStatus = useIdxMarketStatus()

  return (
    <header className='idx-topbar'>
      <button
        type='button'
        className='idx-topbar-menu'
        onClick={onMenuClick}
        aria-label='Open navigation'
      >
        <Menu size={20} aria-hidden />
      </button>
      <h1 className='idx-topbar-title'>{title}</h1>
      <div className='idx-topbar-spacer' />
      <span
        className={`idx-market-status ${marketStatus === 'open' ? 'idx-market-status-open' : ''}`}
        title='Jakarta time'
      >
        <span className='idx-market-status-dot' aria-hidden />
        IDX {marketStatus}
      </span>
    </header>
  )
}
