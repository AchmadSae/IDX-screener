<div align="center">

# IDX + Forex AI Screener

Data-driven screening, prediction, and AI-assisted analysis for Indonesian equities (IDX), gold, silver, and major forex pairs.

[![Node](https://img.shields.io/badge/node-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

> Analysis support only — not financial advice. Predictions are rule-based estimates and AI-assisted reasoning; past performance does not guarantee future results.

## Features

- **Screener** — fundamental/momentum filters for IDX stocks with composite scoring (value / quality / momentum), sector ranking, risk exclusions (notation, UMA, corporate action), and trading-setup presets: Fundamental, Rebound Day, Swing Trade.
- **Prediction Lab** — rules-v2 engine generates target price, stop loss, bullish probability, confidence, and horizon for intraday scalping (`scalping_minutes` 15M, `scalping_hourly` 1H), daily scalping (`scalping` 1 day), `swing` (14 days), and `long_term` (90 days) strategies. Works for IDX stocks, XAU/XAG metals, and 7 major forex pairs.
- **Intraday Scalping** — fetches hourly and 15-minute candle data from TradingView chart API for forex/metal instruments. Computes RSI, EMA, ATR on intraday bars. Tighter targets/stops for rapid scalping. Auto-settles after 1-hour minimum age.
- **AI Analyst (DeepSeek)** — optional DeepSeek-assisted analysis per prediction with structured output (label, probability, targets, reasons, risk warnings), input-hash caching (24h), rate limiting, and persisted run history with token usage and cost estimates. Rules-based predictions always work even without an API key.
- **Prediction History** — global history with filters (symbol, asset class, strategy, status, date range) and outcome evaluation: predictions settle as `won` / `lost` / `expired` after their horizon, with win rate, average return, average drawdown, and calibration buckets by strategy and asset class.
- **TradingView Fallback** — when ZPI IDX API returns empty data for recent dates, automatically falls back to TradingView screener (500/page, paginated) to fetch all ~900 IDX stocks.
- **Forex & Metals** — daily OHLC for `XAU/USD`, `XAG/USD`, `EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CHF`, `USD/CAD`, `AUD/USD` via Yahoo Finance (no API key), with lazy top-up and graceful degradation to cached data. Intraday data via TradingView chart API.
- **Markets** — sector bid/offer aggregates over 1W–12M periods with bid/offer ratio.
- **Watchlist** — star any candidate; stored locally in your browser (device-local by design).
- **Manual Ingestion** — reload button on dashboard triggers Screener + Summary ingestion, outcome evaluation, and cache clear via `POST /api/ingest`, with toast notification.
- **Dark fintech UI** — sidebar navigation, KPI strip, dense tables, detail drawer, responsive down to mobile.

## Architecture

Single long-running **Node.js 20+ / Express** monolith: serves the React UI (built by Vite into `dist/`) and all API routes. Data lives in **PostgreSQL** (local dev; Supabase connection string for production) via **Drizzle ORM** with generated migrations. Optional hourly in-process ingestion cron (IDX official endpoints + Yahoo Finance) when `ENABLE_INGESTION_CRON=true`.

```
src/
  server/            Express monolith (routes, services, repositories, jobs, schemas)
  pages/             React UI (pages, components, hooks, styles)
drizzle/             Git-tracked Postgres migrations
```

## Setup

**Prerequisites:** Node.js 20+, PostgreSQL (local or Supabase), and optionally a [DeepSeek API key](https://platform.deepseek.com/) and [ZPI API key](https://zpi.io/).

```bash
git clone https://github.com/NeaByteLab/IDX-UI.git
cd IDX-UI
cp .env.example .env   # edit DATABASE_URL, optionally ZPI_API_KEY / DEEPSEEK_API_KEY
npm install
```

**Database** (first time only):

```bash
npm run db:migrate     # apply migrations to Postgres
npm run db:seed        # seed the 8 forex/metals instruments
npm run db:init        # optional: backfill ~2 years of IDX data (network heavy)
```

If the `idx_ui` database does not exist yet, create it in pgAdmin or run
`npx tsx -r tsconfig-paths/register src/server/scripts/ensure-db.ts`.

## Running

**Development** (UI on `http://127.0.0.1:50260`, API on `50270`):

```bash
npm run dev
```

**Production:**

```bash
npm run build
ENABLE_INGESTION_CRON=true npm start   # serve on http://127.0.0.1:50270
```

## Checks & tests

```bash
npm run check   # server typecheck + UI typecheck + production UI build
npm test        # vitest: rules engine, indicators, outcome evaluation, scoring fixtures
```

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Express port (default `50270`) |
| `DATABASE_URL` | PostgreSQL connection string (Supabase in production) |
| `ZPI_API_KEY` | Optional in dev, recommended for production — uses ZPI's cached IDX API for stock summary ingestion; also enables TradingView chart/screener endpoints for intraday data and fallback |
| `DEEPSEEK_API_KEY` | Optional — enables AI-assisted analysis |
| `DEEPSEEK_MODEL` | Model name (default `deepseek-chat`) |
| `ENABLE_INGESTION_CRON` | `true` runs hourly IDX + forex ingestion and outcome evaluation in-process |
| `DATABASE_POOL_SIZE` | Postgres pool size (default `10`) |

## Data providers

- **IDX equities** — ZPI cached IDX API for daily trading summaries when `ZPI_API_KEY` is set, with TradingView screener fallback for recent dates when ZPI returns empty data; screener fundamentals still use the IDX screener snapshot.
- **Forex/metals (daily)** — unofficial Yahoo Finance chart endpoint, no key required. The app fetches ~8 lightweight requests hourly at most and degrades to cached data when the provider is unreachable.
- **Forex/metals (intraday)** — TradingView chart API via ZPI proxy, requires `ZPI_API_KEY`. Fetches hourly (1H) and 15-minute (15M) candles for intraday scalping strategies.

## Prediction strategies

| Strategy | Horizon | Target | Stop | Data Source |
|---|---|---|---|---|
| `scalping_minutes` | 15 minutes | 0.3% | 0.15% | TradingView 15M candles |
| `scalping_hourly` | 1 hour | 0.6% | 0.3% | TradingView 1H candles |
| `scalping` | 1 day | 1.2% | 0.6% | Daily OHLC (Yahoo/ZPI) |
| `swing` | 14 days | 4.5% | 2.2% | Daily OHLC |
| `long_term` | 90 days | 12% | 5.5% | Daily OHLC |

Targets and stops widen dynamically when ATR-based sizing exceeds the base floor. Intraday strategies are only available for forex and metal instruments.

## Documentation

- **[API reference](API.md)** — every endpoint, parameters, response shapes, and the typed error contract.

## License

MIT — see [LICENSE](LICENSE).
