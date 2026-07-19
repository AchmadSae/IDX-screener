import React, { useEffect, useMemo, useState } from 'react'
import * as Utils from '@app/pages/utils/index.ts'
import type * as Types from '@app/pages/Types.ts'

type Props = {
  code: string
  detail: Types.StockDetail
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
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
    if (!detail) {
      return { action: 'WAIT', score: 0, reasons: ['No detail data'] as string[] }
    }
    if (detail.hasNotation || detail.hasCorpAction || detail.hasUma) {
      return {
        action: 'WAIT',
        score: 0,
        reasons: ['Corporate action / notation present'] as string[]
      }
    }

    const screenerScore = candidate?.recommendationScore ??
      candidate?.totalScore ??
      candidate?.compositePercentile ??
      (Number.isFinite(detail.compositeScore) ? detail.compositeScore : 0)
    const sentimentRaw = candidate?.newsSentimentScore ?? 0
    const sentimentCount = candidate?.newsSentimentCount ?? 0
    const sentimentScore = sentimentCount > 0 ? clamp(50 + sentimentRaw / 2, 0, 100) : 50

    const momentum = candidate?.selectedMomentumPC ?? candidate?.week13PC ?? detail.week13PC ??
      detail.week26PC ?? detail.week4PC ?? 0
    const momentumScore = clamp(50 + momentum * 2, 0, 100)

    const liquidityValue = candidate?.avgValue20 ?? detail.value ?? candidate?.value ?? 0
    const liquidityVolume = candidate?.avgVolume20 ?? detail.volume ?? candidate?.volume ?? 0
    const liquidityOk = liquidityValue >= 10_000_000_000 && liquidityVolume >= 1_000_000
    const liquidityScore = liquidityOk ? 100 : clamp(
      ((liquidityValue / 10_000_000_000) * 50) + ((liquidityVolume / 1_000_000) * 50),
      0,
      100
    )

    const rsi = candidate?.rsi14 ?? null
    const trendOk = candidate?.bullishTrend === true ||
      (
        candidate?.price != null &&
        candidate.ema20 != null &&
        candidate.ema50 != null &&
        candidate.price > candidate.ema20 &&
        candidate.ema20 > candidate.ema50
      )
    const reversalOk = candidate?.earlyReversal === true ||
      (rsi != null && rsi >= 45 && rsi <= 65 && (candidate?.relVolume ?? 0) >= 1.2)
    const marketRelativeOk = (candidate?.relativeStrength ?? 0) >= 0
    const trendScore = trendOk ? 40 : reversalOk ? 24 : 0
    const rsiScore = rsi == null ? 15 : rsi >= 45 && rsi <= 68 ? 25 : rsi < 35 || rsi > 75 ? 0 : 12
    const adxScore = (candidate?.adx14 ?? 0) >= 18 ? 20 : 8
    const volumeScore = (candidate?.relVolume ?? 0) >= 1.2 ? 10 : 0
    const relativeScore = marketRelativeOk ? 5 : 0
    const technicalScore = clamp(
      trendScore + rsiScore + adxScore + volumeScore + relativeScore,
      0,
      100
    )

    let finalScore = screenerScore * 0.45 +
      technicalScore * 0.25 +
      momentumScore * 0.15 +
      sentimentScore * 0.1 +
      liquidityScore * 0.05

    finalScore = clamp(finalScore, 0, 100)

    let action: 'BUY' | 'SELL' | 'WAIT' = 'WAIT'
    const sentimentBad = sentimentCount > 0 && sentimentRaw <= -25
    const sentimentSupportive = sentimentCount === 0 || sentimentRaw >= -10
    const technicalWeak = !trendOk && !reversalOk && technicalScore < 45
    if (
      finalScore >= 70 &&
      sentimentSupportive &&
      (trendOk || reversalOk) &&
      momentum >= 0 &&
      marketRelativeOk
    ) {
      action = 'BUY'
    } else if (finalScore < 45 || sentimentBad || (momentum < 0 && technicalWeak)) {
      action = 'SELL'
    } else {
      action = 'WAIT'
    }

    const reasons: string[] = []
    reasons.push(`Screener score: ${Utils.Format.formatNum(screenerScore, 0)}`)
    reasons.push(
      `Technical: ${Utils.Format.formatNum(technicalScore, 0)} (${
        trendOk ? 'trend OK' : reversalOk ? 'reversal' : 'weak'
      })`
    )
    if (sentimentCount > 0) {
      reasons.push(`Sentiment: ${Utils.Format.formatNum(sentimentRaw, 0)} (n=${sentimentCount})`)
    } else {
      reasons.push('Sentiment: N/A')
    }
    reasons.push(`Momentum(13w): ${Utils.Format.formatPct(momentum ?? null)}`)
    reasons.push(`RS vs market: ${Utils.Format.formatPct(candidate?.relativeStrength ?? null)}`)
    reasons.push(
      `Liquidity: ${liquidityOk ? 'OK' : 'Low'} (${Utils.Format.formatRp(liquidityValue)})`
    )
    if (rsi != null && Number.isFinite(rsi)) {
      reasons.push(`RSI(14): ${Utils.Format.formatNum(rsi, 1)}`)
    }

    return { action, score: Math.round(finalScore), reasons }
  }, [candidate, detail])

  return (
    <div className='idx-detail-block idx-mt-12'>
      <label className='idx-form-label'>Trade Advisor</label>
      {loading && <div className='idx-loading'>Memeriksa kondisi pasar...</div>}
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
            <strong>Verifikasi Skor:</strong>
            <div className='idx-ml-8'>
              <div>Detail composite: {Utils.Format.formatNum(detail.compositeScore, 3)}</div>
              <div>
                Component scores: Value {Utils.Format.formatNum(detail.valueScore, 3)}, Quality{' '}
                {Utils.Format.formatNum(detail.qualityScore, 3)}, Momentum{' '}
                {Utils.Format.formatNum(detail.momentumScore, 3)}
              </div>
              {candidate && (
                <div>
                  Candidate composite percentile:{' '}
                  {Utils.Format.formatNum(candidate.compositePercentile, 0)}
                </div>
              )}
              {!candidate && (
                <div className='idx-p-muted'>Candidate row unavailable for verification.</div>
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
