import 'dotenv/config'
import * as Services from '@app/server/services/index.ts'

// Dumps the raw IDX screener API field set for one stock so we know exactly
// what fundamental data is available.
const client = new Services.Client()
const response = await client.get(
  'https://www.idx.co.id/support/stock-screener/api/v1/stock-screener/get'
)
console.log('status:', response.status)
const json = (await response.json()) as { results?: Record<string, unknown>[] }
console.log('results:', json.results?.length ?? 0)
const first = json.results?.[0]
if (first != null) {
  console.log('RAW FIELDS:', Object.keys(first).sort().join(', '))
  console.log('sample:', JSON.stringify(first).slice(0, 1200))
}
process.exit(0)
