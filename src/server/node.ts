/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Local development entrypoint — creates the Express app, adds static file
 * serving and SPA fallback for the Vite-built frontend, and starts listening.
 * On Vercel, api/index.ts is used instead.
 */

import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDb } from '@app/server/Database.ts'
import { createApp } from '@app/server/app.ts'
import { IngestJob } from '@app/server/jobs/IngestJob.ts'

const currentFile = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFile)
const projectRoot = path.resolve(currentDir, '../..')
const distRoot = path.join(projectRoot, 'dist')
const port = Number(process.env['PORT'] ?? 50270)

async function main(): Promise<void> {
  const app = createApp()

  app.use('/assets', express.static(path.join(distRoot, 'assets'), {
    immutable: true,
    maxAge: '1y'
  }))

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    res.sendFile(path.join(distRoot, 'index.html'))
  })

  await initDb()

  if (process.env['ENABLE_INGESTION_CRON'] === 'true') {
    IngestJob.run().catch((error) => {
      console.error('[cron] initial ingestion job failed:', error)
    })
    setInterval(() => {
      IngestJob.run().catch((error) => {
        console.error('[cron] ingestion job failed:', error)
      })
    }, 60 * 60 * 1000)
  }

  app.listen(port, () => {
    console.info(`[server] Express monolith listening on http://127.0.0.1:${port}`)
  })
}

main().catch((error) => {
  console.error('[server] failed to start:', error)
  process.exitCode = 1
})
