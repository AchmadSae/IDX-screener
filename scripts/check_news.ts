const POSITIVE = [
  'gain', 'gains', 'up', 'profit', 'beat', 'surge', 'increase', 'growth', 'strong', 'optimis', 'naik', 'baik'
]
const NEGATIVE = [
  'loss', 'losses', 'down', 'drop', 'decline', 'weak', 'warn', 'cut', 'negative', 'fall', 'plunge', 'crash', 'turun', 'rugi'
]

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

async function fetchTitlesForQuery(query: string) {
  const q = encodeURIComponent(query)
  const url = `https://news.google.com/rss/search?q=${q}`
  const resp = await fetch(url)
  if (!resp.ok) {
    console.error('Fetch failed', resp.status)
    return []
  }
  const text = await resp.text()
  const titles: string[] = []
  const re = /<title>(.*?)<\/title>/gi
  let m
  while ((m = re.exec(text)) !== null) {
    const t = m[1].trim()
    if (t && !t.toLowerCase().includes('news')) {
      titles.push(t)
    }
    if (titles.length >= 10) break
  }
  return titles
}

async function scoreCompany(code: string, name: string | null) {
  const query = name && name.trim() !== '' ? `${name} ${code}` : code
  const titles = await fetchTitlesForQuery(query)
  if (titles.length === 0) return { score: 0, count: 0, label: 'neutral', titles }
  let pos = 0
  let neg = 0
  const perTitleMatches: Array<{ title: string; pos: string[]; neg: string[] }> = []
  for (const title of titles) {
    const tokens = tokenize(title)
    const titlePos: string[] = []
    const titleNeg: string[] = []
    for (const t of tokens) {
      if (POSITIVE.includes(t)) {
        pos++
        titlePos.push(t)
      }
      if (NEGATIVE.includes(t)) {
        neg++
        titleNeg.push(t)
      }
    }
    perTitleMatches.push({ title, pos: titlePos, neg: titleNeg })
  }
  const total = titles.length
  const raw = total === 0 ? 0 : (pos - neg) / total
  const score = Math.round(raw * 100)
  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  return { score, count: total, label, pos, neg, titles: perTitleMatches }
}

if (import.meta.main) {
  const code = 'BMRI'
  const name = 'Bank Mandiri'
  console.log(`Fetching news for: ${name} ${code}`)
  try {
    const result = await scoreCompany(code, name)
    console.log('\nResult:')
    console.log(JSON.stringify(result, null, 2))
  } catch (e) {
    console.error('Error scoring company:', e)
  }
}
