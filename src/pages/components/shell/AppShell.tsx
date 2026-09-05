/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@app/pages/components/shell/Sidebar.tsx'
import Topbar from '@app/pages/components/shell/Topbar.tsx'

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className='idx-shell'>
      <Sidebar />
      {mobileNavOpen && (
        <div
          className='idx-sidebar-mobile-overlay'
          onClick={() => setMobileNavOpen(false)}
          role='presentation'
        >
          <Sidebar overlay onNavigate={() => setMobileNavOpen(false)} />
        </div>
      )}
      <div className='idx-shell-main'>
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className='idx-shell-content'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
