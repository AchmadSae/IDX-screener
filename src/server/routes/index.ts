/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type { Context } from '@neabyte/deserve'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function GET(ctx: Context) {
  const indexHtmlPath = path.join(process.cwd(), 'dist', 'index.html')
  const indexHtml = await readFile(indexHtmlPath, 'utf8')
  return ctx.send.html(indexHtml, { status: 200 })
}
