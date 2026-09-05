/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as Schemas from '@app/server/schemas/index.ts'

const databaseUrl = process.env['DATABASE_URL']

if (databaseUrl == null || databaseUrl.trim() === '') {
  throw new Error('DATABASE_URL is required for Supabase Postgres')
}

const client = postgres(databaseUrl, {
  max: Number(process.env['DATABASE_POOL_SIZE'] ?? 10),
  prepare: false
})

const db = drizzle(client, { schema: Schemas })

export async function initDb(): Promise<void> {
  await db.execute(sql`select 1`)
}

export default db
