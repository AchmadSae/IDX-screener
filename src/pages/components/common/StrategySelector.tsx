/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { Flame, TrendingUp, Mountain } from 'lucide-react'

export type StrategyOption = {
  value: 'scalping' | 'swing' | 'long_term'
  label: string
  horizon: string
  icon: typeof Flame
}

export const STRATEGY_OPTIONS: StrategyOption[] = [
  { value: 'scalping', label: 'Scalping', horizon: '1 day', icon: Flame },
  { value: 'swing', label: 'Swing', horizon: '14 days', icon: TrendingUp },
  { value: 'long_term', label: 'Long Term', horizon: '90 days', icon: Mountain }
]

export type StrategySelectorProps = {
  value: 'scalping' | 'swing' | 'long_term'
  onChange: (value: 'scalping' | 'swing' | 'long_term') => void
}

export default function StrategySelector({ value, onChange }: StrategySelectorProps) {
  return (
    <div className='idx-strategy-selector' role='radiogroup' aria-label='Strategy'>
      {STRATEGY_OPTIONS.map((option) => {
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={value === option.value}
            className={`idx-strategy-card ${value === option.value ? 'idx-strategy-card-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            <Icon size={18} aria-hidden />
            <span className='idx-strategy-card-label'>{option.label}</span>
            <span className='idx-strategy-card-horizon'>{option.horizon}</span>
          </button>
        )
      })}
    </div>
  )
}
