/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * News sentiment with an in-memory TTL cache so hot screener requests do not
 * re-scrape Google News RSS for the same company over and over.
 */

import * as Services from '@app/server/services/index.ts'

export type NewsSentimentResult = {
  score: number
  count: number
  label: string
  titles: { title: string; link: string }[]
}

type CacheEntry = {
  expiresAt: number
  result: NewsSentimentResult
}

const TTL_MS = 30 * 60 * 1000
const MAX_ENTRIES = 200
const cache = new Map<string, CacheEntry>()

export class SentimentService {
  private readonly news: Services.News

  constructor() {
    this.news = new Services.News(new Services.Client())
  }

  static async scoreCompany(
    code: string,
    name: string | null
  ): Promise<NewsSentimentResult> {
    return new SentimentService().scoreCompany(code, name)
  }

  async scoreCompany(code: string, name: string | null): Promise<NewsSentimentResult> {
    const key = `${code}:${name ?? ''}`
    const cached = cache.get(key)
    if (cached != null && cached.expiresAt > Date.now()) {
      return cached.result
    }
    const result = await this.news.scoreCompany(code, name)
    cache.set(key, { expiresAt: Date.now() + TTL_MS, result })
    if (cache.size > MAX_ENTRIES) {
      const oldestKey = cache.keys().next().value
      if (oldestKey !== undefined) {
        cache.delete(oldestKey)
      }
    }
    return result
  }
}
