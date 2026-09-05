/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import * as Hooks from '@app/pages/hooks/index.ts'
import { useInstruments } from '@app/pages/hooks/useInstruments.ts'
import type { PredictionAssetClass } from '@app/pages/Types.ts'

export type InstrumentPickerProps = {
  value: string
  onSelect: (symbol: string, assetClass: PredictionAssetClass) => void
}

/**
 * Instrument selection: quick chips for the 8 forex/metals instruments plus a
 * searchable IDX stock list.
 */
export default function InstrumentPicker({ value, onSelect }: InstrumentPickerProps) {
  const [query, setQuery] = useState('')
  const { data: generalData } = Hooks.useGeneral()
  const { data: instruments } = useInstruments()
  const stockList = generalData?.stockList ?? []

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (trimmed === '') {
      return stockList.slice(0, 12)
    }
    return stockList
      .filter(
        (stock) =>
          stock.code.toLowerCase().includes(trimmed) ||
          stock.name.toLowerCase().includes(trimmed)
      )
      .slice(0, 12)
  }, [query, stockList])

  return (
    <div className='idx-instrument-picker'>
      <div className='idx-instrument-chips'>
        {instruments.map((instrument) => (
          <button
            key={instrument.symbol}
            type='button'
            className={`idx-instrument-chip ${
              value === instrument.symbol ? 'idx-instrument-chip-active' : ''
            }`}
            onClick={() => onSelect(instrument.symbol, instrument.assetClass)}
            title={`${instrument.displayName} — ${
              instrument.latestPrice != null ? instrument.latestPrice.toFixed(2) : 'no data'
            }`}
          >
            <span className='idx-instrument-chip-symbol'>{instrument.symbol}</span>
            {instrument.latestPrice != null && (
              <span
                className={`idx-instrument-chip-price ${
                  (instrument.dayChangePct ?? 0) >= 0 ? 'idx-instrument-chip-up' : 'idx-instrument-chip-down'
                }`}
              >
                {instrument.latestPrice.toFixed(2)}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className='idx-instrument-search'>
        <Search size={16} className='idx-instrument-search-icon' aria-hidden />
        <input
          type='text'
          className='idx-instrument-search-input'
          placeholder='Search IDX stock (code or name)...'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label='Search IDX stock'
        />
      </div>
      {matches.length > 0 && (
        <div className='idx-instrument-results'>
          {matches.map((stock) => (
            <button
              key={stock.code}
              type='button'
              className={`idx-instrument-result ${
                value === stock.code ? 'idx-instrument-result-active' : ''
              }`}
              onClick={() => onSelect(stock.code, 'stock')}
            >
              <span className='idx-instrument-result-code'>{stock.code}</span>
              <span className='idx-instrument-result-name'>{stock.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
