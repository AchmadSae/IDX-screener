/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BrainCircuit, CandlestickChart, Sparkles } from 'lucide-react'
import * as Utils from '@app/pages/utils/index.ts'
import PageHeader from '@app/pages/components/common/PageHeader.tsx'
import Disclaimer from '@app/pages/components/common/Disclaimer.tsx'
import ForexDetailDrawer from '@app/pages/components/common/ForexDetailDrawer.tsx'
import InstrumentPicker from '@app/pages/components/common/InstrumentPicker.tsx'
import ProbabilityGauge from '@app/pages/components/common/ProbabilityGauge.tsx'
import StrategySelector from '@app/pages/components/common/StrategySelector.tsx'
import StatusBadge from '@app/pages/components/common/StatusBadge.tsx'
import { useCreatePrediction, usePredictions } from '@app/pages/hooks/usePredictions.ts'
import { useInstruments } from '@app/pages/hooks/useInstruments.ts'
import type * as Types from '@app/pages/Types.ts'

export default function PredictionLab() {
  const [searchParams] = useSearchParams()
  const initialSymbol = searchParams.get('symbol') ?? 'BBCA'
  const [symbol, setSymbol] = useState(initialSymbol)
  const [assetClass, setAssetClass] = useState<Types.PredictionAssetClass>('stock')
  const [strategy, setStrategy] = useState<Types.PredictionStrategy>('swing')
  const [currentPrice, setCurrentPrice] = useState<string>('')
  const [useDeepSeek, setUseDeepSeek] = useState(false)
  const [result, setResult] = useState<Types.PredictionRow | null>(null)
  const [showChart, setShowChart] = useState(false)
  const { create, loading: creating, error: createError } = useCreatePrediction()
  const { data: instruments } = useInstruments()
  const { data: recentPredictions, refetch: refetchRecent } = usePredictions({ limit: 5 })

  useEffect(() => {
    const fromUrl = searchParams.get('symbol')
    if (fromUrl != null && fromUrl !== '') {
      setSymbol(fromUrl.toUpperCase())
    }
  }, [searchParams])

  const selectedInstrument = useMemo(
    () => instruments.find((instrument) => instrument.symbol === symbol) ?? null,
    [instruments, symbol]
  )

  useEffect(() => {
    if (selectedInstrument != null) {
      setAssetClass(selectedInstrument.assetClass)
      if (selectedInstrument.latestPrice != null) {
        setCurrentPrice(String(selectedInstrument.latestPrice))
      }
    }
  }, [selectedInstrument])

  const handleSelect = useCallback((nextSymbol: string, nextAssetClass: Types.PredictionAssetClass) => {
    setSymbol(nextSymbol)
    setAssetClass(nextAssetClass)
    const instrument = instruments.find((item) => item.symbol === nextSymbol)
    setCurrentPrice(instrument?.latestPrice != null ? String(instrument.latestPrice) : '')
    setResult(null)
  }, [instruments])

  const handleRun = useCallback(async () => {
    setResult(null)
    const price = currentPrice.trim() !== '' ? Number(currentPrice) : undefined
    if (price !== undefined && !Number.isFinite(price)) {
      return
    }
    try {
      const prediction = await create({
        symbol,
        assetClass,
        strategy,
        ...(price !== undefined && { currentPrice: price }),
        useDeepSeek
      })
      setResult(prediction)
      refetchRecent()
    } catch {
      // error surfaced via useCreatePrediction
    }
  }, [symbol, assetClass, strategy, currentPrice, useDeepSeek, create, refetchRecent])

  const isForex = assetClass === 'forex' || assetClass === 'metal'
  const formatPrice = (value: number | null | undefined) =>
    Utils.Format.formatPrice(value, assetClass)

  return (
    <div>
      <PageHeader
        title='Prediction Lab'
        subtitle='Rules-based prediction with optional DeepSeek analysis.'
      />
      <div className='idx-prediction-lab-grid'>
        <section className='idx-card idx-prediction-form'>
          <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
            <Sparkles size={18} aria-hidden />
            <span>New Prediction</span>
          </div>
          <div className='idx-field idx-mb-16'>
            <label className='idx-field-label' htmlFor='prediction-instrument'>
              Instrument
            </label>
            <InstrumentPicker value={symbol} onSelect={handleSelect} />
          </div>
          <div className='idx-field idx-mb-16'>
            <span className='idx-field-label'>Strategy</span>
            <StrategySelector value={strategy} onChange={setStrategy} />
          </div>
          <div className='idx-field idx-mb-16'>
            <label className='idx-field-label' htmlFor='prediction-price'>
              Entry price {isForex ? '(USD)' : '(IDR)'}
            </label>
            <input
              id='prediction-price'
              type='number'
              step='any'
              className='idx-input'
              placeholder={isForex ? 'e.g. 2350.50' : 'leave blank for latest close'}
              value={currentPrice}
              onChange={(event) => setCurrentPrice(event.target.value)}
            />
          </div>
          <label className='idx-field-check idx-mb-16'>
            <input
              type='checkbox'
              checked={useDeepSeek}
              onChange={(event) => setUseDeepSeek(event.target.checked)}
            />
            <span>
              <strong>Use DeepSeek analysis</strong>
              <span className='idx-field-check-note'>
                Optional — rules run either way. Requires a server API key.
              </span>
            </span>
          </label>
          {createError != null && <div className='idx-error idx-mb-16'>{createError}</div>}
          <button
            type='button'
            className='idx-btn idx-btn-primary idx-btn-block'
            onClick={handleRun}
            disabled={creating || symbol.trim() === ''}
          >
            {creating ? 'Generating…' : 'Generate Prediction'}
          </button>
          <Disclaimer />
        </section>

        <section className='idx-card idx-prediction-result'>
          <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
            <BrainCircuit size={18} aria-hidden />
            <span>Result</span>
          </div>
          {result == null && (
            <p className='idx-p-muted'>
              Choose an instrument and strategy, then generate a prediction.
            </p>
          )}
          {result != null && (
            <>
              <div className='idx-prediction-result-hero'>
                <ProbabilityGauge value={result.bullishProbability} />
                <div className='idx-prediction-result-meta'>
                  <div className='idx-prediction-result-symbol'>
                    {result.symbol}
                    <StatusBadge status={result.status} />
                  </div>
                  <div className='idx-prediction-result-strategy'>
                    {result.strategy.replace('_', ' ')} · {result.horizonDays} day horizon
                  </div>
                  <div className='idx-prediction-result-model'>
                    {result.modelVersion}
                    {result.aiStatus != null && result.aiStatus !== 'off' && (
                      <span
                        className={`idx-prediction-ai-status ${
                          result.aiStatus === 'ok' ? 'idx-prediction-ai-status-ok' : ''
                        }`}
                      >
                        AI: {result.aiStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='idx-prediction-metrics'>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Entry</span>
                  <span className='idx-prediction-metric-value'>
                    {formatPrice(result.entryPrice)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Target</span>
                  <span className='idx-prediction-metric-value idx-pct-up'>
                    {formatPrice(result.targetPrice)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Stop Loss</span>
                  <span className='idx-prediction-metric-value idx-pct-down'>
                    {formatPrice(result.stopLoss)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Confidence</span>
                  <span className='idx-prediction-metric-value'>
                    {result.confidenceScore.toFixed(0)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Rule Score</span>
                  <span className='idx-prediction-metric-value'>
                    {result.ruleScore.toFixed(0)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>AI Score</span>
                  <span className='idx-prediction-metric-value'>
                    {result.aiScore != null ? result.aiScore.toFixed(0) : '—'}
                  </span>
                </div>
              </div>
              {result.riskNotes.length > 0 && (
                <div className='idx-mt-16'>
                  <span className='idx-field-label'>Risk Notes</span>
                  <ul className='idx-risk-list'>
                    {result.riskNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.aiSummary != null && (
                <div className='idx-ai-summary idx-mt-16'>
                  <span className='idx-field-label'>DeepSeek Analysis</span>
                  <p>{result.aiSummary}</p>
                  {result.aiRun != null && (
                    <div className='idx-ai-summary-meta'>
                      {result.aiRun.model} · {result.aiRun.promptVersion}
                      {result.aiRun.estimatedCostUsd != null &&
                        ` · est. $${result.aiRun.estimatedCostUsd.toFixed(4)}`}
                    </div>
                  )}
                </div>
              )}
              {isForex && (
                <button
                  type='button'
                  className='idx-btn idx-mt-16'
                  onClick={() => setShowChart(true)}
                >
                  <CandlestickChart size={16} aria-hidden />
                  <span>View Chart</span>
                </button>
              )}
            </>
          )}
        </section>
      </div>

      <section className='idx-card idx-mt-24'>
        <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
          <span>Latest Predictions</span>
          <Link to='/history' className='idx-link idx-card-title-action'>
            Full history
          </Link>
        </div>
        {(recentPredictions ?? []).map((prediction) => (
          <div key={prediction.id} className='idx-prediction-recent-row'>
            <span className='idx-overview-prediction-symbol'>{prediction.symbol}</span>
            <span className='idx-overview-prediction-strategy'>
              {prediction.strategy.replace('_', ' ')}
            </span>
            <span>{Utils.Format.formatPrice(prediction.entryPrice, prediction.assetClass)} → {Utils.Format.formatPrice(prediction.targetPrice, prediction.assetClass)}</span>
            <span className='idx-overview-prediction-probability'>
              {Utils.Format.formatPct(prediction.bullishProbability)}
            </span>
            <StatusBadge status={prediction.status} />
          </div>
        ))}
      </section>
      {showChart && result != null && (
        <ForexDetailDrawer
          symbol={result.symbol}
          assetClass={result.assetClass}
          onClose={() => setShowChart(false)}
          onRunPrediction={() => setShowChart(false)}
        />
      )}
    </div>
  )
}
