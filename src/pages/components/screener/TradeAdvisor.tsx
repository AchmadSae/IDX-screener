import React, { useEffect, useMemo, useState } from 'react'
import { getTradeAdvisorDecision } from '@app/pages/components/screener/tradeAdvisorLogic.ts'
import * as Utils from '@app/pages/utils/index.ts'
import type * as Types from '@app/pages/Types.ts'

type Props = {
  code: string
  detail: Types.StockDetail
}

export default function TradeAdvisor({ code, detail }: Props) {
  const [candidate, setCandidate] = useState<Types.CandidateRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchCandidate() {
      setLoading(true)
      setError(null)
      try {
        const q = encodeURIComponent(code)
        const resp = await fetch(
          `/api/candidates?search=${q}&limit=10&setup=fundamental&momentumWeek=13&includeRejected=true&requireNewsSentiment=true`
        )
        if (!resp.ok) {
          throw new Error(`${resp.status} ${resp.statusText}`)
        }
        const json = await resp.json()
        const rows = Array.isArray(json.data) ? json.data as Types.CandidateRow[] : []
        const row = rows.find((item) => item.code === code) ?? rows[0] ?? null
        if (mounted) {
          setCandidate(row)
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    fetchCandidate()
    return () => {
      mounted = false
    }
  }, [code])

  const decision = useMemo(() => {
    return getTradeAdvisorDecision(detail, candidate)
  }, [candidate, detail])

  return (
    <div className='idx-detail-block idx-mt-12'>
      <label className='idx-form-label'>Trade Advisor</label>
      {loading && <div className='idx-loading'>Checking market conditions…</div>}
      {error && <div className='idx-error'>{error}</div>}
      {!loading && !error && (
        <div className='idx-trade-advisor'>
          <div className={`idx-trade-pill idx-trade-${decision.action.toLowerCase()}`}>
            <strong>{decision.action}</strong>
            <span className='idx-ml-8'>{decision.score}</span>
          </div>
          <ul className='idx-trade-reasons'>
            {decision.reasons.map((r) => (
              <li key={r} className='idx-p-muted'>
                {r}
              </li>
            ))}
          </ul>
          <div className='idx-trade-verify idx-mt-8'>
            <strong>Score Verification:</strong>
            <div className='idx-ml-8'>
              <div>Detail composite: {Utils.Format.formatNum(detail.compositeScore, 3)}</div>
              <div>
                Component scores: Value {Utils.Format.formatNum(detail.valueScore, 3)}, Quality{' '}
                {Utils.Format.formatNum(detail.qualityScore, 3)}, Momentum{' '}
                {Utils.Format.formatNum(detail.momentumScore, 3)}
              </div>
              {decision.globalCompositePercentile != null && (
                <div>
                  Global composite percentile:{' '}
                  {Utils.Format.formatNum(decision.globalCompositePercentile, 0)}
                </div>
              )}
              {decision.globalCompositePercentile == null && (
                <div className='idx-p-muted'>Global percentile unavailable for verification.</div>
              )}
            </div>
          </div>
          {candidate?.newsSentimentTitles && candidate.newsSentimentTitles.length > 0 && (
            <div className='idx-detail-block idx-mt-8'>
              <label className='idx-form-label'>Sumber Berita (terpakai)</label>
              <ul className='idx-p-muted idx-ml-8'>
                {candidate.newsSentimentTitles.slice(0, 5).map((a) => (
                  <li key={a.link}>
                    <a href={a.link} target='_blank' rel='noopener noreferrer'>
                      {a.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
