import React, { useEffect, useMemo, useState } from 'react'
import { BrainCircuit, History, Target, TrendingUp } from 'lucide-react'
import * as Utils from '@app/pages/utils/index.ts'

type PredictionRow = {
  id: string
  symbol: string
  assetClass: string
  strategy: string
  horizonDays: number
  entryPrice: number
  targetPrice: number
  stopLoss: number
  bullishProbability: number
  confidenceScore: number
  ruleScore: number
  aiScore: number | null
  aiSummary: string | null
  riskNotes: string[]
  status: string
  createdAt: string
}

type PredictionResponse = {
  data: PredictionRow
}

type HistoryResponse = {
  data: PredictionRow[]
}

const quickSymbols = ['BBCA', 'TLKM', 'XAU/USD', 'XAG/USD', 'AUD/USD', 'EUR/USD']

function strategyLabel(strategy: string): string {
  if (strategy === 'long_term') {
    return 'Long Term'
  }
  return strategy.charAt(0).toUpperCase() + strategy.slice(1)
}

export default function PredictionLab() {
  const [symbol, setSymbol] = useState('BBCA')
  const [assetClass, setAssetClass] = useState('stock')
  const [strategy, setStrategy] = useState('swing')
  const [currentPrice, setCurrentPrice] = useState('')
  const [useDeepSeek, setUseDeepSeek] = useState(false)
  const [prediction, setPrediction] = useState<PredictionRow | null>(null)
  const [history, setHistory] = useState<PredictionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const latestHistory = useMemo(() => history.slice(0, 8), [history])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const response = await fetch('/api/predictions?limit=50')
      if (!response.ok) {
        throw new Error(`History API ${response.status}`)
      }
      const json = await response.json() as HistoryResponse
      setHistory(Array.isArray(json.data) ? json.data : [])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : String(loadError))
    })
  }, [])

  async function handlePredict(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        symbol,
        assetClass,
        strategy,
        useDeepSeek,
        ...(currentPrice.trim() !== '' && { currentPrice: Number(currentPrice) })
      }
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error?.message ?? `Prediction API ${response.status}`)
      }
      const nextPrediction = (json as PredictionResponse).data
      setPrediction(nextPrediction)
      await loadHistory()
    } catch (predictError) {
      setError(predictError instanceof Error ? predictError.message : String(predictError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='idx-main'>
      <section className='idx-prediction-hero'>
        <div>
          <p className='idx-dashboard-subtitle'>Rules + DeepSeek assisted analysis</p>
          <h1 className='idx-dashboard-title'>
            <BrainCircuit size={30} strokeWidth={2} aria-hidden />
            <span>Prediction Lab</span>
          </h1>
        </div>
        <div className='idx-prediction-kpis' aria-label='Prediction summary'>
          <div>
            <span>Total History</span>
            <strong>{history.length}</strong>
          </div>
          <div>
            <span>Latest Signal</span>
            <strong>{prediction?.bullishProbability != null ? `${prediction.bullishProbability}%` : '-'}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{strategyLabel(strategy)}</strong>
          </div>
        </div>
      </section>

      <div className='idx-prediction-grid'>
        <section className='idx-card idx-prediction-panel'>
          <div className='idx-card-header'>
            <h2 className='idx-card-title idx-card-title-with-icon'>
              <Target size={20} aria-hidden />
              <span>New Prediction</span>
            </h2>
          </div>
          <form className='idx-prediction-form' onSubmit={handlePredict}>
            <div className='idx-form-group'>
              <label className='idx-form-label' htmlFor='prediction-symbol'>Symbol</label>
              <input
                id='prediction-symbol'
                className='idx-input'
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                placeholder='BBCA or XAU/USD'
              />
            </div>
            <div className='idx-prediction-quick'>
              {quickSymbols.map((quickSymbol) => (
                <button
                  key={quickSymbol}
                  type='button'
                  className='idx-chip-btn'
                  onClick={() => {
                    setSymbol(quickSymbol)
                    setAssetClass(quickSymbol.startsWith('XAU') || quickSymbol.startsWith('XAG')
                      ? 'metal'
                      : quickSymbol.includes('/')
                      ? 'forex'
                      : 'stock')
                  }}
                >
                  {quickSymbol}
                </button>
              ))}
            </div>
            <div className='idx-prediction-fields'>
              <div className='idx-form-group'>
                <label className='idx-form-label' htmlFor='prediction-asset'>Asset</label>
                <select
                  id='prediction-asset'
                  className='idx-select'
                  value={assetClass}
                  onChange={(event) => setAssetClass(event.target.value)}
                >
                  <option value='stock'>IDX Stock</option>
                  <option value='metal'>Metal</option>
                  <option value='forex'>Forex</option>
                </select>
              </div>
              <div className='idx-form-group'>
                <label className='idx-form-label' htmlFor='prediction-strategy'>Strategy</label>
                <select
                  id='prediction-strategy'
                  className='idx-select'
                  value={strategy}
                  onChange={(event) => setStrategy(event.target.value)}
                >
                  <option value='scalping'>Scalping</option>
                  <option value='swing'>Swing</option>
                  <option value='long_term'>Long Term</option>
                </select>
              </div>
            </div>
            <div className='idx-form-group'>
              <label className='idx-form-label' htmlFor='prediction-price'>Current Price</label>
              <input
                id='prediction-price'
                className='idx-input'
                type='number'
                min='0'
                step='0.0001'
                value={currentPrice}
                onChange={(event) => setCurrentPrice(event.target.value)}
                placeholder='Required for forex/metals until provider is connected'
              />
            </div>
            <label className='idx-toggle-row'>
              <input
                type='checkbox'
                checked={useDeepSeek}
                onChange={(event) => setUseDeepSeek(event.target.checked)}
              />
              <span>Use DeepSeek analysis when API key is configured</span>
            </label>
            <button type='submit' className='idx-btn-primary' disabled={loading}>
              <TrendingUp size={16} aria-hidden />
              <span>{loading ? 'Analyzing...' : 'Run Prediction'}</span>
            </button>
            {error && <div className='idx-error'>{error}</div>}
          </form>
        </section>

        <section className='idx-card idx-prediction-result'>
          <div className='idx-card-header'>
            <h2 className='idx-card-title idx-card-title-with-icon'>
              <TrendingUp size={20} aria-hidden />
              <span>Latest Result</span>
            </h2>
          </div>
          {prediction == null
            ? <p className='idx-p-muted'>No prediction generated in this session.</p>
            : (
              <div className='idx-result-metrics'>
                <div className='idx-result-score'>
                  <span>Bullish Probability</span>
                  <strong>{prediction.bullishProbability}%</strong>
                </div>
                <div>
                  <span>Entry</span>
                  <strong>{Utils.Format.formatRp(prediction.entryPrice)}</strong>
                </div>
                <div>
                  <span>Target</span>
                  <strong>{Utils.Format.formatRp(prediction.targetPrice)}</strong>
                </div>
                <div>
                  <span>Stop</span>
                  <strong>{Utils.Format.formatRp(prediction.stopLoss)}</strong>
                </div>
                <div>
                  <span>Horizon</span>
                  <strong>{prediction.horizonDays}d</strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>{prediction.confidenceScore}%</strong>
                </div>
                {prediction.aiSummary && (
                  <p className='idx-ai-summary'>{prediction.aiSummary}</p>
                )}
                {prediction.riskNotes.length > 0 && (
                  <ul className='idx-risk-list'>
                    {prediction.riskNotes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                )}
              </div>
            )}
        </section>
      </div>

      <section className='idx-card idx-prediction-history'>
        <div className='idx-card-header'>
          <h2 className='idx-card-title idx-card-title-with-icon'>
            <History size={20} aria-hidden />
            <span>Global Prediction History</span>
          </h2>
        </div>
        {historyLoading && <div className='idx-loading'>Loading prediction history...</div>}
        {!historyLoading && latestHistory.length === 0 && (
          <p className='idx-p-muted'>No saved prediction history yet.</p>
        )}
        {latestHistory.length > 0 && (
          <div className='idx-table-wrap'>
            <table className='idx-detail-table'>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Asset</th>
                  <th>Strategy</th>
                  <th>Entry</th>
                  <th>Target</th>
                  <th>Stop</th>
                  <th>Bullish</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latestHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.symbol}</td>
                    <td>{row.assetClass}</td>
                    <td>{strategyLabel(row.strategy)}</td>
                    <td>{Utils.Format.formatRp(row.entryPrice)}</td>
                    <td>{Utils.Format.formatRp(row.targetPrice)}</td>
                    <td>{Utils.Format.formatRp(row.stopLoss)}</td>
                    <td>{row.bullishProbability}%</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
