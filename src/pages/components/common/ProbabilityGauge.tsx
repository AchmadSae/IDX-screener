/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'

export type ProbabilityGaugeProps = {
  /** 0-100 bullish probability. */
  value: number
  size?: number
}

/** Semi-circular gauge; color shifts red -> amber -> green with the value. */
export default function ProbabilityGauge({ value, size = 160 }: ProbabilityGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const stroke = 12
  const radius = (size - stroke) / 2
  const halfCircumference = Math.PI * radius
  const progress = (clamped / 100) * halfCircumference
  const color = clamped < 40 ? 'var(--idx-down)' : clamped < 60 ? 'var(--idx-warning)' : 'var(--idx-up)'

  return (
    <div className='idx-probability-gauge' style={{ width: size, height: size / 2 + stroke }}>
      <svg
        width={size}
        height={size / 2 + stroke}
        viewBox={`0 0 ${size} ${size / 2 + stroke}`}
        role='img'
        aria-label={`Bullish probability ${clamped} percent`}
      >
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill='none'
          stroke='var(--idx-border)'
          strokeWidth={stroke}
          strokeLinecap='round'
        />
        {progress > 0 && (
          <path
            d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
            fill='none'
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap='round'
            strokeDasharray={`${progress} ${halfCircumference * 2}`}
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        )}
        <text
          x='50%'
          y={size / 2 - stroke / 2}
          textAnchor='middle'
          fill='var(--idx-text)'
          fontSize={size / 6.5}
          fontWeight={800}
        >
          {Math.round(clamped)}%
        </text>
      </svg>
    </div>
  )
}
