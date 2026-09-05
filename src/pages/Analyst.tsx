/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import React, { useCallback, useState } from 'react'
import { BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react'
import * as Utils from '@app/pages/utils/index.ts'
import PageHeader from '@app/pages/components/common/PageHeader.tsx'
import Disclaimer from '@app/pages/components/common/Disclaimer.tsx'
import EmptyState from '@app/pages/components/common/EmptyState.tsx'
import InstrumentPicker from '@app/pages/components/common/InstrumentPicker.tsx'
import ProbabilityGauge from '@app/pages/components/common/ProbabilityGauge.tsx'
import StrategySelector from '@app/pages/components/common/StrategySelector.tsx'
import { useAnalysisRuns, useRunAnalysis } from '@app/pages/hooks/useAnalyses.ts'
import type * as Types from '@app/pages/Types.ts'

const LABEL_CLASS: Record<string, string> = {
  bullish: 'idx-analyst-label idx-analyst-label-bullish',
  neutral: 'idx-analyst-label idx-analyst-label-neutral',
  bearish: 'idx-analyst-label idx-analyst-label-bearish'
}

export default function Analyst() {
  const [symbol, setSymbol] = useState('BBCA')
  const [assetClass, setAssetClass] = useState<Types.PredictionAssetClass>('stock')
  const [strategy, setStrategy] = useState<Types.PredictionStrategy>('swing')
  const [result, setResult] = useState<Types.AnalysisResult | null>(null)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const { run, loading, error } = useRunAnalysis()
  const { data: runs, loading: runsLoading, refetch } = useAnalysisRuns(20)

  const handleRun = useCallback(async () => {
    setResult(null)
    try {
      const analysis = await run({ symbol, assetClass, strategy })
      setResult(analysis)
      refetch()
    } catch {
      // error surfaced via useRunAnalysis
    }
  }, [run, symbol, assetClass, strategy, refetch])

  const formatPrice = (value: number | null | undefined) =>
    Utils.Format.formatPrice(value, assetClass)

  return (
    <div>
      <PageHeader
        title='AI Analyst'
        subtitle='DeepSeek-assisted analysis: compare the rule engine with model reasoning.'
      />
      <div className='idx-prediction-lab-grid'>
        <section className='idx-card idx-prediction-form'>
          <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
            <BrainCircuit size={18} aria-hidden />
            <span>Run Analysis</span>
          </div>
          <div className='idx-field idx-mb-16'>
            <span className='idx-field-label'>Instrument</span>
            <InstrumentPicker
              value={symbol}
              onSelect={(nextSymbol, nextAssetClass) => {
                setSymbol(nextSymbol)
                setAssetClass(nextAssetClass)
                setResult(null)
              }}
            />
          </div>
          <div className='idx-field idx-mb-16'>
            <span className='idx-field-label'>Strategy</span>
            <StrategySelector value={strategy} onChange={setStrategy} />
          </div>
          {error != null && <div className='idx-error idx-mb-16'>{error}</div>}
          <button
            type='button'
            className='idx-btn idx-btn-primary idx-btn-block'
            onClick={handleRun}
            disabled={loading || symbol.trim() === ''}
          >
            {loading ? 'Analyzing…' : 'Run Analysis'}
          </button>
          <Disclaimer />
        </section>

        <section className='idx-card idx-prediction-result'>
          <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
            <span>Analysis Result</span>
          </div>
          {result == null && (
            <p className='idx-p-muted'>
              {loading ? 'DeepSeek is thinking…' : 'Select an instrument and run the analysis.'}
            </p>
          )}
          {result != null && (
            <>
              <div className='idx-prediction-result-hero'>
                <ProbabilityGauge
                  value={
                    result.aiResult?.bullishProbability ??
                    result.rulePrediction.bullishProbability
                  }
                />
                <div className='idx-prediction-result-meta'>
                  <div className='idx-prediction-result-symbol'>
                    {result.symbol}
                    {result.aiResult?.label != null && (
                      <span className={LABEL_CLASS[result.aiResult.label] ?? LABEL_CLASS['neutral']}>
                        {result.aiResult.label}
                      </span>
                    )}
                  </div>
                  <div className='idx-prediction-result-strategy'>
                    {result.strategy.replace('_', ' ')} · {result.model} · {result.promptVersion}
                  </div>
                  <div className='idx-prediction-result-model'>
                    status: {result.status}
                    {result.estimatedCostUsd != null &&
                      ` · est. $${result.estimatedCostUsd.toFixed(4)}`}
                  </div>
                  {result.status === 'skipped' && (
                    <div className='idx-analyst-skipped'>
                      DeepSeek API key is not configured on the server — showing the rules engine
                      result only.
                    </div>
                  )}
                </div>
              </div>
              <div className='idx-prediction-metrics'>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Rules Target</span>
                  <span className='idx-prediction-metric-value idx-pct-up'>
                    {formatPrice(result.rulePrediction.targetPrice)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>AI Target</span>
                  <span className='idx-prediction-metric-value'>
                    {result.aiResult?.targetPrice != null
                      ? formatPrice(result.aiResult.targetPrice)
                      : '—'}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Rules Stop</span>
                  <span className='idx-prediction-metric-value idx-pct-down'>
                    {formatPrice(result.rulePrediction.stopLoss)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>AI Stop</span>
                  <span className='idx-prediction-metric-value'>
                    {result.aiResult?.stopLoss != null
                      ? formatPrice(result.aiResult.stopLoss)
                      : '—'}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>Rules Confidence</span>
                  <span className='idx-prediction-metric-value'>
                    {result.rulePrediction.confidenceScore.toFixed(0)}
                  </span>
                </div>
                <div className='idx-prediction-metric'>
                  <span className='idx-prediction-metric-label'>AI Confidence</span>
                  <span className='idx-prediction-metric-value'>
                    {result.aiResult?.confidenceScore != null
                      ? result.aiResult.confidenceScore.toFixed(0)
                      : '—'}
                  </span>
                </div>
              </div>
              {result.aiResult != null && result.aiResult.reasons.length > 0 && (
                <div className='idx-mt-16'>
                  <span className='idx-field-label'>AI Reasons</span>
                  <ul className='idx-risk-list'>
                    {result.aiResult.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.aiResult != null && result.aiResult.riskWarnings.length > 0 && (
                <div className='idx-mt-16'>
                  <span className='idx-field-label'>Risk Warnings</span>
                  <ul className='idx-risk-list'>
                    {result.aiResult.riskWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.aiSummary != null && (
                <div className='idx-ai-summary idx-mt-16'>
                  <span className='idx-field-label'>Full Model Response</span>
                  <p>{result.aiSummary}</p>
                </div>
              )}
              {result.aiResult?.disclaimer != null && (
                <p className='idx-analyst-disclaimer idx-mt-16'>
                  {result.aiResult.disclaimer}
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <section className='idx-card idx-mt-24'>
        <div className='idx-card-title idx-card-title-with-icon idx-mb-16'>
          <span>Recent Runs</span>
        </div>
        {!runsLoading && runs.length === 0 && (
          <EmptyState
            icon={BrainCircuit}
            title='No analyses yet'
            message='Run your first analysis above — every run is cached and recorded here.'
          />
        )}
        {(runs ?? []).map((runRow) => {
          const expanded = expandedRun === runRow.id
          return (
            <div key={runRow.id} className='idx-analyst-run'>
              <button
                type='button'
                className='idx-analyst-run-header'
                onClick={() => setExpandedRun(expanded ? null : runRow.id)}
                aria-expanded={expanded}
              >
                {expanded ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                <span className='idx-overview-prediction-symbol'>{runRow.symbol}</span>
                <span className='idx-overview-prediction-strategy'>
                  {runRow.strategy.replace('_', ' ')}
                </span>
                <span className='idx-analyst-run-status'>{runRow.status}</span>
                <span className='idx-analyst-run-model'>{runRow.model}</span>
                <span className='idx-analyst-run-date'>
                  {new Date(runRow.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </button>
              {expanded && (
                <div className='idx-analyst-run-detail'>
                  <span className='idx-field-label'>Summary</span>
                  <p className='idx-ai-summary'>
                    {runRow.responseSummary ?? runRow.errorMessage ?? 'No response recorded.'}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
