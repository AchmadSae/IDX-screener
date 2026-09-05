/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export type DrawerProps = {
  title: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  /** Max panel width in px (defaults to 560; content may shrink on small screens). */
  width?: number
  closeLabel?: string
}

/**
 * Right-side detail drawer: fixed panel with backdrop, slide-in animation,
 * Esc/backdrop close, and focus management (focus moves to the close button
 * on open and returns to the previously focused element on close).
 */
export default function Drawer({ title, onClose, children, width = 560, closeLabel = 'Close' }: DrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousActiveRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousActiveRef.current?.focus?.()
    }
  }, [onClose])

  const handleClose = useCallback(() => {
    previousActiveRef.current?.focus?.()
    onClose()
  }, [onClose])

  return (
    <div className='idx-drawer-overlay' onClick={handleClose} role='presentation'>
      <div
        className='idx-drawer'
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        <div className='idx-drawer-header'>
          <h2 className='idx-drawer-title'>{title}</h2>
          <button
            ref={closeButtonRef}
            type='button'
            className='idx-drawer-close'
            onClick={handleClose}
            aria-label={closeLabel}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className='idx-drawer-body'>{children}</div>
      </div>
    </div>
  )
}
