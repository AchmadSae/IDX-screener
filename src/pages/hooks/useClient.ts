/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type * as Types from '@app/pages/Types.ts'
import { debugLogRequest, debugLogResponse } from '@app/pages/utils/debugLog.ts'

export async function fetchApi<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Types.ClientOptions
): Promise<T> {
  const url = new URL(path, globalThis.location?.origin ?? '')
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      if (paramValue !== undefined && paramValue !== '') {
        url.searchParams.set(paramKey, String(paramValue))
      }
    }
  }
  const method = options?.method ?? 'GET'
  const init: RequestInit = {
    ...(options?.signal != null ? { signal: options.signal } : {}),
    method,
    ...(options?.body !== undefined
      ? {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options.body)
        }
      : {})
  }

  const startTime = performance.now()
  debugLogRequest(method, path, params, options?.body)

  const response = await fetch(url.toString(), init)
  const durationMs = Math.round(performance.now() - startTime)

  if (!response.ok) {
    const errorBody = await response.text()
    const error = new Error(
      response.status === 400
        ? errorBody || 'Bad request'
        : `API ${response.status}: ${errorBody || response.statusText}`
    )
    debugLogResponse(method, path, response.status, durationMs, error)
    throw error
  }

  debugLogResponse(method, path, response.status, durationMs)
  return response.json() as Promise<T>
}
