/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import { Router } from '@neabyte/deserve'
import { initDb } from '@app/server/Database.ts'
import * as Services from '@app/server/services/index.ts'
import type * as Types from '@app/server/Types.ts'

const assetContentTypes: Record<string, string> = {
  css: 'text/css; charset=utf-8',
  gif: 'image/gif',
  html: 'text/html; charset=utf-8',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  map: 'application/json; charset=utf-8',
  png: 'image/png',
  svg: 'image/svg+xml',
  wasm: 'application/wasm',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2'
}

async function runFetchData(): Promise<void> {
  const fetcher = new Services.Fetcher()
  await fetcher.run()
}

const distRoot = `${Deno.cwd()}/dist`
const assetsRoot = `${distRoot}/assets`
;(Deno as unknown as Types.DenoCron).cron(
  'Fetch IDX screener and stock summary',
  '0 * * * *',
  async () => {
    try {
      await runFetchData()
    } catch (error) {
      console.error('[cron] Fetch IDX data failed:', error)
    }
  }
)
const router = new Router({
  routesDir: `${Deno.cwd()}/src/server/routes`,
  staticHandler: {
    async serve(ctx, options, urlPath) {
      let filePath = ctx.pathname.slice(urlPath.length)
      if (filePath.startsWith('/')) {
        filePath = filePath.slice(1)
      }
      if (filePath === '' || filePath.includes('\\') || filePath.split('/').includes('..')) {
        return await ctx.handleError(404, new Error('File not found'))
      }

      const basePath = await Deno.realPath(options.path)
      const fullPath = await Deno.realPath(`${basePath}/${filePath}`).catch(() => null)
      if (
        !fullPath ||
        (fullPath !== basePath &&
          !fullPath.startsWith(`${basePath}\\`) &&
          !fullPath.startsWith(`${basePath}/`))
      ) {
        return await ctx.handleError(404, new Error('File not found'))
      }

      const fileInfo = await Deno.stat(fullPath).catch(() => null)
      if (!fileInfo?.isFile) {
        return await ctx.handleError(404, new Error('File not found'))
      }

      const extension = filePath.split('.').pop()?.toLowerCase() ?? ''
      const headers = new Headers({
        'Content-Length': fileInfo.size.toString(),
        'Content-Type': assetContentTypes[extension] ?? 'application/octet-stream'
      })
      if (options.cacheControl !== undefined) {
        headers.set('Cache-Control', `public, max-age=${options.cacheControl}`)
      }

      return new Response((await Deno.open(fullPath, { read: true })).readable, { headers })
    }
  }
})

router.static('/assets', {
  path: assetsRoot,
  etag: true,
  cacheControl: 31536000
})

router.catch(async (ctx, error) => {
  if (error.statusCode !== 404 || ctx.request.method !== 'GET') {
    return null
  }
  if (ctx.pathname.includes('.')) {
    return null
  }
  const accept = ctx.request.headers.get('accept') ?? ''
  const wantsHtml = accept.includes('text/html') || accept.includes('*/*') || accept === ''
  if (!wantsHtml) {
    return null
  }
  const html = await Deno.readTextFile(`${distRoot}/index.html`)
  return ctx.send.html(html, { status: 200 })
})

router
  .serve(50270)
  .then(async () => {
    await initDb()
    await runFetchData()
  })
  .catch((error) => {
    console.error('[server] Error serving router:', error)
  })
