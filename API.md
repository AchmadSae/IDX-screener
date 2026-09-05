# API Reference

- **Base URL:** `http://127.0.0.1:50270`
- **From the dev UI:** `/api` requests are proxied to the base URL above (Vite, port 50260).

## Error contract

Every non-2xx response uses one shape:

```json
{ "error": { "code": "INVALID_PARAM_DATE", "message": "start and end required (yyyymmdd, 8 digits)", "requestId": "<uuid>" } }
```

The `requestId` also appears in the `X-Request-Id` response header. Common codes: `INVALID_PARAM_*`, `PREDICTION_INPUT_ERROR`, `UNKNOWN_INSTRUMENT`, `PRICE_UNAVAILABLE`, `STOCK_NOT_FOUND`, `INTERNAL_SERVER_ERROR`.

---

## Health

```http
GET /api/health
```

- Return: `{ ok, service, ts, root }` — service status.

```bash
curl -s 'http://127.0.0.1:50270/api/health'
```

## General

```http
GET /api/general
```

- Return: `{ stockList: [{code, name}], industries[], sectors[], subSectors[], subIndustries[] }` — filter metadata for the screener UI.

## Candidates

```http
GET /api/candidates
```

- Query params:
  - `date` — (optional) summary snapshot date (yyyymmdd). Default: today (falls back to the latest available).
  - `setup` — `fundamental` (default) | `rebound` | `swing`. Selects the setup preset scoring.
  - `defaultFilter` — (optional) `true` applies tuned per-setup defaults (fundamental: perMin 3, perMax 18, roeMin 15, derMax 0.8, momentumWeek 13, momentumMin 10, minValue 10B, minVolume 1M, exclusions on; else: perMax 25, roeMin 0, derMax 2, momentumMin 0, momentumWeek 26).
  - `perMin`, `perMax`, `roeMin`, `derMax`, `pbvMax`, `minMarketCapital`, `netMarginMin`, `minValue`, `minVolume`, `momentumWeek` (1|4|13|26), `momentumMin`, `relativeStrengthMin` — numeric filters.
  - `excludeNotation`, `excludeCorpAction`, `excludeUma`, `smartMoneyOnly`, `requireBullishTrend`, `requireEarlyReversal`, `includeRejected` — booleans (`1`/`true`).
  - `vw`, `qw`, `mw` — composite weights.
  - `withSectorRank` — include `sectorRank`/`sectorPercentile` per row.
  - `sector` — exact sector filter; `search` — case-insensitive code/name/sector substring.
  - `limit` (default 500, max 1000), `offset` — pagination.
  - `requireNewsSentiment`, `minNewsSentiment` — optionally attach Google News sentiment per paginated row (cached 30 min).
- Return: `{ date, totalCount, limit, offset, serverTimestamp, data[] }` — dense candidate rows with fundamentals, technicals, scores, flags, and recommendation fields.

```bash
curl -s 'http://127.0.0.1:50270/api/candidates?defaultFilter=true&limit=10&offset=0'
```

## Ranked / screener aggregates

```http
GET /api/screener/ranked
GET /api/screener/rsi
GET /api/screener/bid-offer
GET /api/sector/strength
```

- `ranked`: `limit`, `offset`, `vw`/`qw`/`mw`, `withSectorRank` → ranked array (no date filter).
- `rsi`: `date`, `period` (1–100, default 14) → `{ date, period, data: { byCode[], bySector } }`.
- `bid-offer`: `date` → `{ date, data: [{ sector, bidVolume, offerVolume, count }] }` for one day.
- `sector/strength`: `week` (26|52), `source` (`ohlc` or screener fields) → `[{ sector, avgMomentum, count, rank }]`.

## Per-stock series

```http
GET /api/:code/ohlc
GET /api/:code/rsi
GET /api/:code/foreign
GET /api/:code/bid-offer
GET /api/stock/:code/detail
```

- Path: `code` — stock code (e.g. `BBCA`).
- Query: `start`, `end` (required, yyyymmdd, `end >= start`); `detail` also accepts `date`.
- Returns: OHLC+bid/offer series; RSI series with sector average (`sectorData`); foreign buy/sell/net with summary; bid/offer volumes; stock detail with fundamentals, scores, flags, and OHLC.
- Errors: `400` for invalid code/dates, `404 STOCK_NOT_FOUND`.

## History bid-offer

```http
GET /api/history/bid-offer
```

- Query: `start`, `end` (required, yyyymmdd), `limit` (max day span, default 365 — start is shifted to keep the span).
- Return: `{ start, end, byDate[], bySector[] }` — per-date sector aggregates and per-sector totals with `avgBid`, `avgOffer`, `ratio`.

## Forex / metals instruments

```http
GET /api/instruments
```

- Return: `{ data: [{ symbol, displayName, assetClass, currency, exchange, provider, latestPrice, latestDateInt, dayChangePct }], stale }`.
- Backfills Yahoo Finance daily bars lazily on first load; `stale: true` means cached data is older than yesterday (provider unreachable). Never fails the request.

```http
GET /api/instruments/:symbol/ohlc?days=90
```

- Path: `symbol` — URL-encode pairs (`XAU%2FUSD`).
- Query: `days` (1–365, default 90).
- Return: `{ data: { symbol, dateInt[], priceOpen[], priceHigh[], priceLow[], priceClose[], volume[] } }` — flat series for charting.

## Predictions

```http
POST /api/predictions
```

- Body: `{ symbol, assetClass?, strategy?, currentPrice?, useDeepSeek? }`
  - `symbol` — stock code or instrument (e.g. `BBCA`, `XAU/USD`). Required.
  - `assetClass` — `stock` | `forex` | `metal`. Inferred from the symbol when omitted.
  - `strategy` — `scalping` | `swing` (default) | `long_term`.
  - `currentPrice` — optional entry price; falls back to the latest stored close.
  - `useDeepSeek` — optional; DeepSeek failures never block the rules prediction.
- Return `201`: `{ data: { ...prediction, aiStatus, aiRun } }` — rules-v2 output (target, stop, probabilities, horizon, risk notes) plus optional AI results.
- Errors: `400 PREDICTION_INPUT_ERROR` / `INVALID_PARAM_STRATEGY` / `INVALID_PARAM_ASSET_CLASS` / `UNKNOWN_INSTRUMENT`, `409 PRICE_UNAVAILABLE`.

```http
GET /api/predictions
```

- Query: `symbol`, `assetClass`, `strategy`, `status` (`open`|`won`|`lost`|`expired`), `dateFrom`, `dateTo` (yyyymmdd), `limit` (default 20, max 200), `offset`.
- Return: `{ data: [{ ...prediction, outcome: { referencePrice, returnPercent, maxFavorableExcursion, maxAdverseExcursion, hitTarget, hitStop, evaluatedAt } | null }], meta: { totalCount, limit, offset } }`.
- Open predictions are settled lazily on read once their horizon window has fully elapsed.

```http
GET /api/predictions/stats
```

- Return: `{ data: { counts: { total, open, won, lost, expired }, overall: { winRate, avgReturn, avgDrawdown, settledCount }, byStrategy[], byAssetClass[], calibration[] } }`.
- `winRate = won / (won + lost)`; `avgReturn`/`avgDrawdown` over settled rows; `calibration` buckets bullish probability in 10-point ranges.

## AI Analyst

```http
POST /api/analyses
```

- Body: same shape as `POST /api/predictions` — runs rules + DeepSeek **without** saving a prediction.
- Return: `{ data: { runId, symbol, assetClass, strategy, promptVersion, model, status, rulePrediction, aiResult, aiSummary, errorMessage, tokens, estimatedCostUsd } }`.
- `status`: `success` | `failed` | `cached` (reused a 24h input-hash hit) | `skipped` (no API key configured).

```http
GET /api/analyses?symbol=&assetClass=&limit=20
```

- Return: `{ data: [ai_analysis_runs rows] }` — recent runs (prompt version, status, summary, token usage, cost estimate).
