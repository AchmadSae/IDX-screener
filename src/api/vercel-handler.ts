/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Vercel serverless entrypoint — lazy-loads the Express app and DB on first
 * request to avoid cold-start crashes from module-level side effects.
 */

let app: any = null
let dbReady: Promise<void> | null = null

async function getApp(): Promise<any> {
  if (app === null) {
    const { createApp } = await import('../server/app.ts')
    app = createApp()
  }
  return app
}

function ensureDb(): Promise<void> {
  if (dbReady === null) {
    dbReady = import('../server/Database.ts')
      .then((m) => m.initDb())
      .catch((error) => {
        console.error('[api] initDb failed:', error)
        dbReady = null
        throw error
      })
  }
  return dbReady
}

export default async function handler(req: any, res: any): Promise<void> {
  try {
    const expressApp = await getApp()
    await ensureDb()
    return new Promise<void>((resolve, reject) => {
      res.on('finish', resolve)
      res.on('error', reject)
      expressApp(req, res, (error?: unknown) => {
        if (error != null) reject(error)
      })
    })
  } catch (error) {
    console.error('[api] Handler error:', error)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    }
  }
}
