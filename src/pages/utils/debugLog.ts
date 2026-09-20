/**
 * Debug logging utility for API requests
 * Only logs in development mode (when import.meta.env.DEV is true)
 */

const IS_DEV = import.meta.env.DEV

export function debugLogRequest(
  method: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  body?: unknown
): void {
  if (!IS_DEV) return

  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
  const url = new URL(path, globalThis.location?.origin ?? '')
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      if (paramValue !== undefined && paramValue !== '') {
        url.searchParams.set(paramKey, String(paramValue))
      }
    }
  }

  console.group(`[dev:api] ${method} ${url.pathname}`)
  console.log('params:', params ? Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  ) : {})
  if (body) {
    console.log('body:', body)
  }
  console.log('url:', url.toString())
  console.log('time:', timestamp)
  console.groupEnd()
}

export function debugLogResponse(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  error?: Error
): void {
  if (!IS_DEV) return

  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
  const statusColor = status >= 400 ? 'color: #ef4444' : 'color: #22c55e'

  if (error) {
    console.error(`[dev:api] ${method} ${path} → ${status} (${durationMs}ms) [ERROR]`, error)
  } else {
    console.log(`%c[dev:api] ${method} ${path} → ${status} (${durationMs}ms)`, statusColor)
  }
}