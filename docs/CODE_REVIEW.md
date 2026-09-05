# IDX UI Code Review

Date: 2026-09-05

Skill used: `.claude/skills/code-reviewer`. The bundled `code_quality_checker.py` was run with UTF-8 output enabled and reported 0 findings, so this report is based on manual review against the skill checklist categories: organization, performance, security, maintainability, and deployment readiness.

## Executive Summary

The current app is a Deno + Vite + React stock screener using Drizzle with SQLite/libSQL. It already has useful IDX ingestion, ranking, technical indicators, watchlist, sector strength, and basic trade-advisor behavior. The main risk is that backend behavior is concentrated in filesystem-routed Deno handlers and one very large candidates route. That makes the requested Node.js, Express, MySQL/Supabase, prediction history, DeepSeek analysis, forex support, and fintech UI rewrite better handled as a staged refactor instead of direct feature additions.

Recommended direction:

1. Establish a Node/Express backend package boundary and migrate runtime/config first.
2. Move database access to a MySQL-compatible Drizzle schema with migrations and environment-based connection config.
3. Split screener logic into services/use-cases before adding prediction and AI analysis.
4. Add prediction persistence and audit history before showing AI recommendations.
5. Rewrite the UI around a modern fintech dashboard information architecture.

## Findings

### High: Runtime and deployment model is locked to Deno APIs

References:

- `deno.json:70-75`
- `src/server/index.ts:37-110`
- `src/server/routes/index.ts:11-13`
- `src/server/routes/api/health.ts:12`

The backend uses `Deno.cwd()`, `Deno.cron`, `Deno.realPath`, `Deno.stat`, `Deno.open`, `Deno.readTextFile`, and a JSR router package. This cannot run directly as a standard Node/Express server or Vercel serverless function. A migration requires more than creating `package.json`; the server bootstrap, cron job, static file serving, route loading, and filesystem access all need Node equivalents.

Recommended fix:

- Replace `@neabyte/deserve` filesystem routing with explicit Express routers under `src/server/routes`.
- Replace `Deno.cron` with either Vercel Cron hitting an ingestion endpoint or an external scheduler.
- Replace Deno file APIs with Express static middleware and Node `fs/promises` only where needed.
- Add `package.json`, `tsconfig.node.json`, environment loading, and Node build/start scripts.

### High: Current database layer is SQLite/libSQL-specific

References:

- `src/server/Database.ts:10-18`
- `src/server/schemas/Screener.ts:9-11`
- `src/server/schemas/Summary.ts:9-11`
- `drizzle.config.json:4-7`

The schema imports `sqliteTable` and the DB client uses `drizzle-orm/libsql` with `@libsql/client`. Supabase's managed database is PostgreSQL, not MySQL. If the target is truly MySQL, it should be hosted on a MySQL provider such as PlanetScale, Railway, Aiven, AWS RDS, or a separate MySQL service. If the target is Supabase, the architecture should use PostgreSQL Drizzle tables instead of MySQL.

Recommended fix:

- Decide between Supabase Postgres and MySQL before schema migration.
- For Supabase: migrate to `drizzle-orm/postgres-js` or `drizzle-orm/node-postgres`, `pgTable`, and Postgres migrations.
- For MySQL: migrate to `drizzle-orm/mysql2`, `mysqlTable`, and a MySQL provider.
- Add tables for predictions, prediction outcomes, AI analysis runs, provider usage, and market instruments.

### High: `/api/candidates` is too large and mixes responsibilities

References:

- `src/server/routes/api/candidates.ts:42`
- `src/server/routes/api/candidates.ts:179`
- `src/server/routes/api/candidates.ts:313-407`
- `src/server/routes/api/candidates.ts:743-793`

The candidates route handles request parsing, default policy, DB reads, historical windowing, technical calculations, scoring, setup rules, sector ranking, pagination, optional news sentiment, and error responses. This makes regression risk high and will make prediction/DeepSeek/forex support difficult to test.

Recommended fix:

- Split into `candidateQueryParser`, `marketDataRepository`, `technicalIndicatorService`, `candidateScoringService`, `sentimentService`, and `candidateController`.
- Unit test each scoring setup with fixed fixtures.
- Keep Express handlers thin: validate input, call use-case, return typed response.

### High: Errors in candidates return successful empty responses

Reference:

- `src/server/routes/api/candidates.ts:789-793`

The catch block logs the error but returns a JSON response with empty data and no error status. The frontend and users cannot distinguish "no candidates" from backend failure, DB failure, IDX outage, or AI/news failure.

Recommended fix:

- Return non-2xx status for unexpected failures.
- Use typed error responses: `{ error: { code, message, requestId } }`.
- Add health checks for DB connectivity and latest ingestion timestamp.

### Medium: External news sentiment calls are made during user requests

References:

- `src/pages/Screener.tsx:47`
- `src/pages/Screener.tsx:61`
- `src/pages/components/screener/TradeAdvisor.tsx:27`
- `src/server/routes/api/candidates.ts:743-762`

The rebound/swing presets and trade advisor can trigger Google News RSS scraping during a user request. This adds latency, makes response time dependent on third-party availability, and can multiply outbound calls when multiple users refresh the screener.

Recommended fix:

- Move sentiment and DeepSeek analysis to persisted background jobs with TTL caching.
- Add per-symbol analysis status fields so the UI can show cached, running, stale, or failed states.
- Rate-limit AI/provider calls by user/session and by instrument.

### Medium: Current trade advisor is deterministic scoring, not a prediction feature

Reference:

- `src/pages/components/screener/TradeAdvisor.tsx:35-173`

The existing trade advisor labels BUY/SELL/WAIT from composite, technical, momentum, sentiment, and liquidity heuristics. It does not generate a target price, time horizon, confidence interval, stop loss, model version, or save prediction history. This is useful as a rules-based advisor but does not meet the requested prediction-history goal.

Recommended fix:

- Create a server-side prediction use-case with explicit inputs and outputs: instrument, strategy, horizon, entry price, bullish probability, target price, stop loss, confidence, rationale, and model/rule version.
- Persist each prediction and later evaluate actual outcome against price history.
- Show historical prediction accuracy by strategy, symbol, and model version.

### Medium: Data model is IDX-only

References:

- `src/server/services/Client.ts:9`
- `src/server/services/Screener.ts:14-16`
- `src/pages/Screener.tsx:33`

The ingestion client and many UI labels assume Indonesian equities. Forex support needs a general instrument abstraction because forex has different symbols, sessions, OHLC feeds, volume semantics, fundamentals, and risk models.

Recommended fix:

- Add `instruments` with `asset_class`, `exchange`, `symbol`, `display_name`, `currency`, and provider metadata.
- Keep IDX fundamentals separate from forex price/technical data.
- Add provider adapters for IDX and forex rather than expanding the existing IDX client.

### Medium: Frontend state and table design will not scale cleanly to AI workflows

References:

- `src/pages/Screener.tsx:67-235`
- `src/pages/components/screener/CandidatesTable.tsx:18-274`
- `src/pages/hooks/useWatchlist.ts:15-41`

The main screener page owns many unrelated states and the table mixes watchlist actions, search, pagination, setup-specific columns, accessibility behavior, and display formatting. Watchlist is local-only. AI analysis, prediction history, saved goals, and forex filters will require more structured state and navigation.

Recommended fix:

- Reframe the UI around dashboard sections: Overview, Screener, Prediction Lab, AI Analyst, History, Watchlist, Settings.
- Extract table column definitions per strategy/asset class.
- Move persisted user state such as watchlist and prediction history to the database when auth is added.

### Low: README contains corrupted characters and outdated runtime documentation

References:

- `README.md:36-78`
- `README.md:84`

The README displays mojibake characters and documents Deno/SQLite workflows. This will confuse setup during migration.

Recommended fix:

- Rewrite README after runtime migration with Node, DB, environment variables, migrations, Vercel deployment, cron, and AI provider setup.

## Architecture Recommendation

Target backend:

- Node.js 20+ with Express.
- Drizzle ORM with either Supabase Postgres or a MySQL provider.
- Explicit routers and controllers.
- Service/use-case layer for screening, indicators, prediction, AI analysis, and ingestion.
- Background ingestion via Vercel Cron or external worker.
- Cached analysis results in DB; no expensive AI call in the hot screener list path.

Target frontend:

- React dashboard with route-level pages.
- A modern fintech layout: compact sidebar, top KPI strip, sortable/filterable tables, watchlist, detail drawer/modal, prediction panel, and AI analysis history.
- Shared design tokens, clean neutral base, limited semantic colors for bullish/bearish/risk states.

## Proposed Refactor Phases

### Phase 1: Runtime and Build Migration

- Add `package.json`.
- Add Node TypeScript config and scripts.
- Replace Deno imports and import maps with Node-compatible path aliases.
- Replace `@neabyte/deserve` server with Express.
- Keep React build temporarily on Vite unless a full SSR/backend-rendered rewrite is intentionally desired.

Note: Vercel production deployment usually pairs well with Vite static frontend plus serverless API functions. If the requirement is "from Vite to Express" for the backend architecture, keep Vite as frontend tooling. If the requirement is "no Vite at all", the frontend build strategy needs a separate decision.

### Phase 2: Database Migration

- Decide Supabase Postgres vs MySQL.
- Convert Drizzle schema dialect.
- Create migration files.
- Add `DATABASE_URL` and separate dev/prod DB config.
- Seed or migrate existing SQLite data.

### Phase 3: Domain Refactor

- Extract candidate scoring and setup logic from route handlers.
- Add unit tests for scoring and indicators.
- Add typed validation for query params.
- Add consistent error responses.

### Phase 4: Prediction Feature

- Add prediction tables and evaluation jobs.
- Implement target price / bullish probability / horizon output.
- Store prediction history and outcome summaries.
- Add UI for symbol prediction and historical accuracy.

### Phase 5: DeepSeek AI Analyst

- Add DeepSeek provider adapter.
- Store prompts, sanitized inputs, model output, cost metadata, and result status.
- Add strategy modes: scalping, swing, long-term.
- Add forex-safe prompt/data path using technical data instead of equity fundamentals.

### Phase 6: UI Rewrite

- Create dashboard IA and wireframe.
- Build reusable components: KPI cards, screener table, detail drawer, AI panel, prediction history chart/table, strategy selector.
- Add responsive QA for desktop and mobile.

## PRD Discovery Questions

The PRD skill requires discovery before I write the final PRD file. Please answer these before PRD generation:

1. Database target: do you want Supabase Postgres, or do you truly require MySQL hosted somewhere else?
2. Deployment target: should production be Vercel serverless functions, a long-running Express server, or split frontend on Vercel plus backend elsewhere?
3. Prediction scope for MVP: should prediction be rules-based first, DeepSeek-assisted first, or both?
4. Forex data provider: which source should the app use for forex OHLC/prices?
5. User accounts: do you need login and per-user saved prediction history in MVP, or is global/local history enough first?

