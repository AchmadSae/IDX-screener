import type * as Types from '@app/server/services/Types.ts'

type NewsArticle = {
  title: string
  link: string
  source: string | null
  publishedAt: string | null
}

const COMPANY_STOP_WORDS = new Set([
  'pt',
  'tbk',
  'persero',
  'terbuka',
  'indonesia',
  'bank',
  'sekuritas',
  'perusahaan'
])

const POSITIVE_PHRASES: [string, number][] = [
  ['laba bersih naik', 3],
  ['pendapatan naik', 2.5],
  ['revenue growth', 2],
  ['profit growth', 2.5],
  ['bagikan dividen', 2],
  ['dividen jumbo', 2],
  ['kontrak baru', 2],
  ['ekspansi', 1.5],
  ['buyback', 1.5],
  ['upgrade', 1.5],
  ['target harga naik', 1.5],
  ['outperform', 1.5],
  ['akumulasi', 1],
  ['menguat', 1],
  ['rebound', 1]
]

const NEGATIVE_PHRASES: [string, number][] = [
  ['rugi bersih', 3],
  ['laba turun', 2.5],
  ['pendapatan turun', 2],
  ['gagal bayar', 3],
  ['suspensi', 3],
  ['suspend', 3],
  ['uma', 2],
  ['downgrade', 2],
  ['target harga turun', 1.5],
  ['anjlok', 2],
  ['melemah', 1],
  ['fraud', 3],
  ['korupsi', 3],
  ['pailit', 3],
  ['utang membengkak', 2.5],
  ['rights issue', 1],
  ['dilusi', 1.5]
]

function xmlDecode(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function normalizedTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/gi, ' ').trim()
}

function companyTokens(code: string, name: string | null): string[] {
  const rawTokens = `${code} ${name ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return [
    ...new Set(rawTokens.filter((token) => token.length >= 3 && !COMPANY_STOP_WORDS.has(token)))
  ]
}

function isRelevant(article: NewsArticle, code: string, name: string | null): boolean {
  const text = normalizedTitle(`${article.title} ${article.source ?? ''}`)
  const codeLower = code.toLowerCase()
  if (text.includes(codeLower)) {
    return true
  }
  const tokens = companyTokens(code, name)
  return tokens.some((token) => text.includes(token))
}

function recencyWeight(publishedAt: string | null): number {
  if (publishedAt == null || publishedAt === '') {
    return 1
  }
  const publishedMs = Date.parse(publishedAt)
  if (!Number.isFinite(publishedMs)) {
    return 1
  }
  const ageDays = (Date.now() - publishedMs) / 86_400_000
  if (ageDays <= 7) {
    return 1.2
  }
  if (ageDays <= 30) {
    return 1
  }
  return 0.7
}

function scoreArticle(article: NewsArticle): number {
  const text = normalizedTitle(article.title)
  let score = 0
  for (const [phrase, weight] of POSITIVE_PHRASES) {
    if (text.includes(phrase)) {
      score += weight
    }
  }
  for (const [phrase, weight] of NEGATIVE_PHRASES) {
    if (text.includes(phrase)) {
      score -= weight
    }
  }
  return Math.max(-4, Math.min(4, score)) * recencyWeight(article.publishedAt)
}

export class News {
  private readonly client: Types.Client

  constructor(client: Types.Client) {
    this.client = client
  }

  async fetchArticlesForQuery(query: string): Promise<NewsArticle[]> {
    const q = encodeURIComponent(`${query} saham OR IDX when:30d`)
    const url = `https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`
    const resp = await this.client.get(url)
    if (!resp.ok) {
      return []
    }
    const text = await resp.text()
    const articles: NewsArticle[] = []
    const seen = new Set<string>()
    const itemRe = /<item>([\s\S]*?)<\/item>/gi
    let mItem: RegExpExecArray | null
    while ((mItem = itemRe.exec(text)) !== null) {
      const item = mItem[1] ?? ''
      const title = xmlDecode(/<title>([\s\S]*?)<\/title>/i.exec(item)?.[1] ?? '')
      const link = xmlDecode(/<link>([\s\S]*?)<\/link>/i.exec(item)?.[1] ?? '')
      const publishedAt = xmlDecode(/<pubDate>([\s\S]*?)<\/pubDate>/i.exec(item)?.[1] ?? '')
      const source = xmlDecode(/<source[^>]*>([\s\S]*?)<\/source>/i.exec(item)?.[1] ?? '')
      const key = normalizedTitle(title)
      if (title === '' || link === '' || seen.has(key)) {
        continue
      }
      seen.add(key)
      articles.push({
        title,
        link,
        source: source !== '' ? source : null,
        publishedAt: publishedAt !== '' ? publishedAt : null
      })
      if (articles.length >= 20) {
        break
      }
    }
    return articles
  }

  async scoreCompany(
    code: string,
    name: string | null
  ): Promise<
    { score: number; count: number; label: string; titles: { title: string; link: string }[] }
  > {
    const query = name && name.trim() !== '' ? `${code} ${name}` : code
    try {
      const articles = (await this.fetchArticlesForQuery(query))
        .filter((article) => isRelevant(article, code, name))
      if (articles.length === 0) {
        return { score: 0, count: 0, label: 'neutral', titles: [] }
      }
      const weightedScore = articles.reduce((sum, article) => sum + scoreArticle(article), 0)
      const score = Math.round(
        Math.max(-100, Math.min(100, (weightedScore / articles.length) * 25))
      )
      const label = score >= 15 ? 'positive' : score <= -15 ? 'negative' : 'neutral'
      return {
        score,
        count: articles.length,
        label,
        titles: articles.map((article) => ({ title: article.title, link: article.link }))
      }
    } catch (e) {
      console.warn(`[news] scoring failed for ${query}:`, String(e))
      return { score: 0, count: 0, label: 'neutral', titles: [] }
    }
  }
}

export default News
