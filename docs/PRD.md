# Product Requirements Document: IDX + Forex AI Screener

Date: 2026-09-05

## 1. Executive Summary

**Problem Statement**: The current IDX Screener is useful for rule-based stock screening, but it is tied to Deno, SQLite, and an older UI structure that makes production deployment, persisted prediction history, AI-assisted analysis, and forex expansion difficult.

**Proposed Solution**: Refactor the app into a long-running Node.js + Express monolith serving both React UI and backend logic, backed by Supabase Postgres, with rules-based and DeepSeek-assisted prediction workflows for IDX stocks, metals, and major forex pairs.

**Success Criteria**:

- The app runs in production from one Express process that serves UI assets and all API routes.
- All persistent data uses Supabase Postgres through Drizzle ORM migrations.
- A user can generate a stock or forex prediction with target price, bullish probability, confidence, horizon, and rationale.
- Every prediction is saved to global history and can be reviewed later with actual outcome status.
- The redesigned dashboard supports desktop and mobile layouts without overlapping text or broken tables.

## 2. User Experience & Functionality

**User Personas**:

- Retail IDX trader who needs ranked candidate stocks for swing, scalping, or long-term trading.
- Multi-market trader who watches IDX equities, gold, silver, and major currency pairs.
- Analyst/operator who wants repeatable prediction history instead of one-off manual notes.

**User Stories**:

- As a trader, I want to screen IDX stocks by strategy so that I can find candidates that match my trading style.
- As a trader, I want to predict bullish probability and target price for a selected instrument so that I can decide whether the setup is worth tracking.
- As a trader, I want DeepSeek-assisted analysis so that I can compare quantitative rules with AI-generated reasoning.
- As a trader, I want to view historical predictions so that I can evaluate whether the system has been accurate.
- As a forex/metals trader, I want to analyze XAU, XAG, and major currency pairs so that the same dashboard supports my non-stock workflow.
- As an app operator, I want a single long-running Express app so that deployment and operations stay simple.

**Acceptance Criteria**:

- Screener supports strategy modes: `scalping`, `swing`, and `long_term`.
- Prediction output includes: instrument, asset class, strategy, generated timestamp, input price, target price, stop loss, horizon, bullish probability, confidence score, rule score, DeepSeek summary, and risk notes.
- Prediction history lists saved predictions globally with filters by symbol, asset class, strategy, date range, and outcome status.
- Prediction history can summarize win rate, average return, average drawdown, and count by strategy.
- DeepSeek analysis is optional per prediction and failures do not block rules-based prediction.
- Forex/metals instruments include at minimum: `XAU/USD`, `XAG/USD`, `AUD/USD`, `EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CHF`, and `USD/CAD`.
- UI uses a modern fintech dashboard layout with sidebar navigation, KPI strip, dense screener table, detail drawer, prediction panel, and history view.
- Backend returns typed non-2xx error responses for unexpected API failures.

**Non-Goals**:

- No broker integration or automatic trade execution in MVP.
- No paid financial advice claims or guaranteed profit language.
- No per-user accounts in MVP; prediction history is global.
- No portfolio accounting, tax reporting, or order management in MVP.
- No full machine-learning model training pipeline in MVP; prediction starts with transparent rules plus DeepSeek-assisted reasoning.

## 3. AI System Requirements

**Tool Requirements**:

- DeepSeek API for natural-language market analysis.
- Server-side API key storage through environment variables; keys must never be exposed to the browser.
- Prompt templates by asset class and strategy.
- Cached AI analysis records in Supabase Postgres.
- Rules engine that can produce a prediction without AI availability.

**DeepSeek Input Contract**:

- Instrument metadata: symbol, name, asset class, exchange/provider, currency.
- Market data: latest price, OHLC history, RSI, EMA, ADX, momentum, relative volume when available.
- IDX fundamentals when asset class is stock: PER, PBV, ROE, ROA, DER, market cap, revenue, sector, notation/corporate-action flags.
- Strategy goal: `scalping`, `swing`, or `long_term`.
- Risk context: horizon, volatility proxy, support/resistance, liquidity.

**DeepSeek Output Contract**:

- Recommendation label: `bullish`, `neutral`, or `bearish`.
- Bullish probability from 0 to 100.
- Target price and stop loss.
- Time horizon.
- Key reasons.
- Risk warnings.
- Confidence score from 0 to 100.
- Explicit disclaimer that output is analysis support, not guaranteed profit.

**Evaluation Strategy**:

- Store each rules score, AI score, target price, and actual future outcome.
- Evaluate prediction after configured horizon using stored OHLC data.
- Track win rate by strategy and asset class.
- Track calibration buckets, for example predictions with 70-80 bullish probability should win close to that range over enough samples.
- Add regression fixtures for rules-based prediction calculations.
- Manually review at least 30 saved AI analyses before treating DeepSeek output as production-ready.

## 4. Technical Specifications

**Architecture Overview**:

- Runtime: Node.js 20+.
- Server: Express monolith.
- Frontend: React UI built into static assets and served by Express.
- Database: Supabase Postgres.
- ORM: Drizzle ORM with Postgres schema and generated migrations.
- Deployment: one long-running Express process.
- Scheduler: internal cron for local/dev and production-safe scheduler endpoint or process scheduler for ingestion.

**Recommended Backend Layers**:

- `controllers`: Express request/response handling.
- `routes`: API route registration.
- `services`: screener, prediction, DeepSeek, sentiment, technical indicators, ingestion.
- `repositories`: database reads/writes.
- `schemas`: Drizzle database tables.
- `validators`: request parsing and validation.
- `jobs`: IDX and forex ingestion, prediction outcome evaluation.

**Core Data Tables**:

- `instruments`: symbol, asset class, exchange/provider, display name, currency, active flag.
- `stock_screener`: IDX fundamentals and classification.
- `market_ohlc`: instrument ID, date/time, open, high, low, close, volume.
- `technical_snapshots`: instrument ID, timestamp, RSI, EMA, ADX, momentum, volatility.
- `predictions`: instrument ID, strategy, horizon, entry price, target price, stop loss, bullish probability, confidence, rule score, AI score, status.
- `prediction_outcomes`: prediction ID, evaluated timestamp, exit/reference price, max favorable excursion, max adverse excursion, return percent, hit target flag, hit stop flag.
- `ai_analysis_runs`: provider, model, prompt version, input hash, response summary, token usage, cost estimate, status, error.

**Integration Points**:

- IDX official data endpoints for Indonesian stock data.
- Forex/metals OHLC provider, selected later from available provider options.
- DeepSeek chat/completion API.
- Supabase Postgres connection through `DATABASE_URL`.
- Optional future auth if prediction history becomes per-user.

**Security & Privacy**:

- DeepSeek API key and database credentials must only exist server-side.
- Log provider errors without logging full secrets or sensitive request headers.
- Sanitize and cap AI prompt payloads.
- Rate-limit AI analysis endpoints.
- Add request validation for symbol, strategy, horizon, pagination, and date ranges.
- Add legal/UX disclaimer for market prediction outputs.

## 5. Risks & Roadmap

**Phased Rollout**:

- MVP Phase 1: Node/Express monolith migration, Supabase Postgres schema, current IDX screener parity, and typed error handling.
- MVP Phase 2: Rules-based prediction service, prediction tables, global history, and outcome evaluation job.
- MVP Phase 3: DeepSeek-assisted analysis with caching, prompt versions, and usage tracking.
- v1.1: Forex/metals instruments with provider adapter and strategy-specific analysis.
- v1.2: Full fintech dashboard UI rewrite with Prediction Lab and AI Analyst pages.
- v2.0: Optional user accounts, saved watchlists in DB, alerting, and model calibration reports.

**Technical Risks**:

- Supabase is Postgres, so schema migration must not follow a MySQL implementation path.
- Long-running Express hosting is not the default Vercel model; deployment may need Railway, Render, Fly.io, VPS, or another Node server host if a persistent process is required.
- AI calls can be slow or fail; the app must keep rules-based analysis available.
- Forex data quality depends heavily on the chosen provider.
- Existing route logic is large and needs tests before refactor to avoid ranking regressions.

**Open Decisions**:

- Final production host for the long-running Express server.
- Forex/metals data provider and subscription limits.
- Default prediction horizons per strategy.
- Whether Vite remains as the frontend build tool while Express serves the built UI, or whether the frontend tooling is also replaced.

