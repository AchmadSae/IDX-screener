/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Info, LineChart } from 'lucide-react'
import { NAV_ITEMS } from '@app/pages/navigation.ts'

export type SidebarProps = {
  /** When true the sidebar renders as an overlay drawer (mobile). */
  overlay?: boolean
  onNavigate?: () => void
}

export default function Sidebar({ overlay = false, onNavigate }: SidebarProps) {
  const location = useLocation()
  const isActive = (itemPath: string, exact?: boolean) =>
    exact ? location.pathname === itemPath : location.pathname.startsWith(itemPath)

  return (
    <nav className={`idx-sidebar ${overlay ? 'idx-sidebar-overlay' : ''}`} aria-label='Primary'>
      <Link to='/' className='idx-sidebar-brand' onClick={onNavigate}>
        <div className='idx-logo-icon'>
          <LineChart size={22} strokeWidth={2.2} />
        </div>
        <span className='idx-sidebar-brand-text'>
          IDX <span>+ Forex AI</span>
        </span>
      </Link>
      <ul className='idx-sidebar-nav'>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`idx-sidebar-item ${
                  isActive(item.path, item.exact) ? 'idx-sidebar-item-active' : ''
                }`}
                title={item.label}
                onClick={onNavigate}
              >
                <Icon size={18} aria-hidden />
                <span className='idx-sidebar-item-text'>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className='idx-sidebar-footer'>
        <Link
          to='/about'
          className={`idx-sidebar-item ${isActive('/about') ? 'idx-sidebar-item-active' : ''}`}
          title='About'
          onClick={onNavigate}
        >
          <Info size={18} aria-hidden />
          <span className='idx-sidebar-item-text'>About & Disclaimer</span>
        </Link>
        <p className='idx-sidebar-disclaimer'>
          Analysis support only — not financial advice.
        </p>
      </div>
    </nav>
  )
}
