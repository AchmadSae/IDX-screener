/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React from 'react'
import { Info } from 'lucide-react'

export default function About() {
  return (
    <div>
      <div className='idx-card idx-about-card'>
        <h1 className='idx-dashboard-title idx-about-title'>
          <Info size={28} strokeWidth={2} aria-hidden />
          <span>About This App</span>
        </h1>
        <p className='idx-about-intro'>
          Free screening, prediction, and AI-assisted analysis for Indonesian
          equities (IDX), gold, silver, and major forex pairs —{' '}
          <strong>by @NeaByteLab</strong>.
        </p>

        <div className='idx-home-article'>
          <p className='idx-home-p'>
            The <strong>IDX + Forex AI Screener</strong> helps you filter issuers by
            fundamentals (<strong>valuation</strong>, <strong>profitability</strong>,{' '}
            <strong>leverage</strong>), price <strong>momentum</strong>, and{' '}
            <strong>liquidity</strong>, then ranks them with a composite score — a structured
            candidate list for further research, not a random list of tickers.
          </p>
          <p className='idx-home-p'>
            Fundamental data and trading summaries come from official sources (IDX public
            endpoints); forex and metals daily bars come from the unofficial Yahoo Finance
            chart endpoint (no API key required). Scores are computed on the server with a
            factor-investing methodology (<strong>value</strong>, <strong>quality</strong>,{' '}
            <strong>momentum</strong>) with uniform normalization and weights across all
            issuers, so rankings stay consistent and reproducible.
          </p>

          <h2 className='idx-home-h2'>What You Can Do</h2>
          <ul className='idx-home-ul'>
            <li className='idx-home-li'>
              <strong>Screener</strong>: ranked candidates with code, name, sector,{' '}
              <strong>PER</strong>, <strong>ROE</strong>, <strong>DER</strong>, 26w/52w returns,
              and composite percentile. Setup presets: Fundamental, Rebound Day, Swing Trade.
            </li>
            <li className='idx-home-li'>
              <strong>Prediction Lab</strong>: rules-v2 engine generates target price, stop loss,
              bullish probability, confidence, and horizon for{' '}
              <strong>scalping</strong> (1 day), <strong>swing</strong> (14 days), and{' '}
              <strong>long term</strong> (90 days) strategies — for IDX stocks, metals, and
              forex pairs.
            </li>
            <li className='idx-home-li'>
              <strong>AI Analyst</strong>: optional DeepSeek-assisted analysis with structured
              output (label, probability, targets, reasons, risk warnings). Rules-based
              predictions always work without an API key.
            </li>
            <li className='idx-home-li'>
              <strong>History</strong>: every prediction is tracked and settled against actual
              prices after its horizon — win rate, average return, average drawdown, and
              calibration buckets by strategy and asset class.
            </li>
            <li className='idx-home-li'>
              <strong>Markets</strong>: sector bid/offer aggregates over 1W–12M periods with
              bid/offer ratio, plus per-sector RSI and bid-vs-offer views.
            </li>
            <li className='idx-home-li'>
              <strong>Watchlist</strong>: star candidates from the screener; stored locally in
              this browser (device-local by design).
            </li>
          </ul>

          <h3 className='idx-home-h3'>Methodology in Brief</h3>
          <p className='idx-home-p'>
            The composite score combines three pillars with these weights and indicators:
          </p>
          <ul className='idx-home-ul'>
            <li className='idx-home-li'>
              <strong>Valuation (40%)</strong>: low <strong>PER</strong> &{' '}
              <strong>PBV</strong> = relatively cheap.
            </li>
            <li className='idx-home-li'>
              <strong>Quality (30%)</strong>: <strong>ROE</strong>, <strong>ROA</strong>,{' '}
              <strong>DER</strong> for profitability and debt health.
            </li>
            <li className='idx-home-li'>
              <strong>Momentum (30%)</strong>: 26w/52w returns for price trend.
            </li>
          </ul>
          <p className='idx-home-p'>
            Values are <strong>normalized</strong> to a 0–1 scale and then{' '}
            <strong>weighted</strong>. Indicators where &quot;lower is better&quot; ({' '}
            <strong>PER</strong>, <strong>PBV</strong>, <strong>DER</strong>) are inverted so
            the ranking aligns with value and quality logic.
          </p>
          <p className='idx-home-p'>
            The rules-v2 prediction engine scores fundamentals (stocks) or technicals
            (forex/metals: EMA trend, RSI, 20-bar return) and sizes targets/stops with ATR
            volatility — base percentages act as floors. Prediction outcomes are evaluated
            from stored OHLC data after each horizon: <strong>won</strong> when the target is
            reached first, <strong>lost</strong> when the stop is hit first,{' '}
            <strong>expired</strong> when neither is touched.
          </p>
          <p className='idx-home-p'>
            AI analyses are cached for 24 hours by input hash, rate-limited, and recorded in
            the run history with token usage and cost estimates. Manual review of at least 30
            saved AI analyses is recommended before treating model output as
            production-ready.
          </p>

          <div className='idx-home-note idx-home-note-mt24'>
            <strong>Disclaimer</strong>: Use the screener, predictions, and AI analysis only
            as a <em>starting point for research</em> — never as the sole basis for an
            investment decision. Always do your own due diligence, read financial reports and
            issuer announcements, and consider market risk, macro conditions, and company
            fundamentals before investing. Data and scores here are informational and do not
            guarantee future results; this app does not provide buy/sell recommendations or{' '}
            <strong>investment advice</strong>, and prediction outputs are not guaranteed
            profit. All investment decisions remain entirely the user&apos;s responsibility.
            The developer is not liable for any losses, claims, or consequences arising from
            the use of this app.
          </div>
        </div>
      </div>
    </div>
  )
}
