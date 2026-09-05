import 'dotenv/config'
import { YahooFinance, toYahooTicker } from '@app/server/services/YahooFinance.ts'

console.log('ticker XAU/USD →', toYahooTicker('XAU/USD'))
const result = await YahooFinance.fetchDailyBars('XAU/USD', '1y')
console.log(
  'fetch XAU/USD:',
  result.ok ? `ok, ${result.bars.length} bars, last close ${result.bars[result.bars.length - 1]?.close}` : `failed: ${result.error}`
)
process.exit(0)
