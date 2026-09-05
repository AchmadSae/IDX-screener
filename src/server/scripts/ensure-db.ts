/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import 'dotenv/config'
import postgres from 'postgres'

/**
 * Ensures the database named in DATABASE_URL exists locally.
 *
 * Connects to the `postgres` maintenance database with the same credentials and
 * creates the target database when it is missing. Run with:
 *   npx tsx -r tsconfig-paths/register src/server/scripts/ensure-db.ts
 */
async function main(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL']
  if (databaseUrl == null || databaseUrl.trim() === '') {
    throw new Error('DATABASE_URL is required')
  }

  const parsed = new URL(databaseUrl)
  const targetDb = parsed.pathname.replace(/^\//, '')
  if (!/^[a-z0-9_]+$/i.test(targetDb)) {
    throw new Error(`DATABASE_URL must name a simple database identifier, got: ${targetDb || '(empty)'}`)
  }

  parsed.pathname = '/postgres'
  const maintenanceUrl = parsed.toString()
  const sql = postgres(maintenanceUrl, { max: 1, prepare: false })

  try {
    const existing = await sql<{ datname: string }[]>`
      SELECT datname FROM pg_database WHERE datname = ${targetDb}
    `
    if (existing.length > 0) {
      console.log(`[ensure-db] database "${targetDb}" already exists`)
      return
    }
    await sql.unsafe(`CREATE DATABASE "${targetDb}"`)
    console.log(`[ensure-db] created database "${targetDb}"`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error('[ensure-db] failed:', error)
  process.exitCode = 1
})
