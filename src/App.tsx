/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@app/pages/components/shell/AppShell.tsx'
import Home from '@app/pages/Home.tsx'
import About from '@app/pages/About.tsx'
import Screener from '@app/pages/Screener.tsx'
import Historical from '@app/pages/Historical.tsx'
import PredictionLab from '@app/pages/PredictionLab.tsx'
import History from '@app/pages/History.tsx'
import Analyst from '@app/pages/Analyst.tsx'
import Watchlist from '@app/pages/Watchlist.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/screener' element={<Screener />} />
        <Route path='/prediction' element={<PredictionLab />} />
        <Route path='/history' element={<History />} />
        <Route path='/analyst' element={<Analyst />} />
        <Route path='/watchlist' element={<Watchlist />} />
        <Route path='/markets' element={<Historical />} />
        <Route path='/historical' element={<Navigate to='/markets' replace />} />
      </Route>
    </Routes>
  )
}
