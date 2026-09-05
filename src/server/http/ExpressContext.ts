import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import type { Context } from '@neabyte/deserve'

function queryValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }
  return undefined
}

export function createExpressContext(
  req: ExpressRequest,
  res: ExpressResponse
): Context {
  return {
    request: new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`, {
      method: req.method,
      headers: req.headers as HeadersInit
    }),
    pathname: req.path,
    query(name: string) {
      return queryValue(req.query[name])
    },
    param(name: string) {
      return queryValue(req.params[name])
    },
    send: {
      json(body: unknown, init?: { status?: number }) {
        res.status(init?.status ?? 200).json(body)
      },
      html(body: string, init?: { status?: number }) {
        res.status(init?.status ?? 200).type('html').send(body)
      }
    }
  }
}
