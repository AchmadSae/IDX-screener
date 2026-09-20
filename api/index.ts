/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Vercel serverless entrypoint — wraps the Express app as a handler for all
 * /api/* routes. Static files and SPA routing are handled by Vercel CDN + rewrites.
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { createApp } from '../src/server/app.ts'
import { initDb } from '../src/server/Database.ts'

const app = createApp()
let dbReady: Promise<void> | null = null

function ensureDb(): Promise<void> {
  if (dbReady === null) {
    dbReady = initDb().catch((error) => {
      dbReady = null
      throw error
    })
  }
  return dbReady
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await ensureDb()
  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve)
    res.on('error', reject)
    app(req, res, (error?: unknown) => {
      if (error != null) {
        reject(error)
      }
    })
  })
}
