import * as Utils from '@app/pages/utils/index.ts'
import type * as Types from '@app/pages/Types.ts'

export type TradeAdvisorAction = 'BUY' | 'SELL' | 'WAIT'

export type TradeAdvisorDecision = {
  action: TradeAdvisorAction
  score: number
  reasons: string[]
  screenerScore: number
  globalCompositePercentile: number | null
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function getGlobalCompositePercentile(
  detail: Types.StockDetail,
  candidate: Types.CandidateRow | null
): number | null {
  if (Number.isFinite(detail.compositePercentile)) {
    return detail.compositePercentile
  }
  if (
    Number.isFinite(detail.rank) &&
    Number.isFinite(detail.rankedCount) &&
    detail.rank > 0 &&
    detail.rankedCount > 0
  ) {
    return Math.round((1 - (detail.rank - 1) / detail.rankedCount) * 1000) / 10
  }
  return candidate?.compositePercentile ?? null
}

export function getTradeAdvisorDecision(
  detail: Types.StockDetail,
  candidate: Types.CandidateRow | null
): TradeAdvisorDecision {
  if (!detail) {
    return {
      action: 'WAIT',
      score: 0,
      reasons: ['No detail data'],
      screenerScore: 0,
      globalCompositePercentile: null
    }
  }
  if (detail.hasNotation || detail.hasCorpAction || detail.hasUma) {
    return {
      action: 'WAIT',
      score: 0,
      reasons: ['Corporate action / notation present'],
      screenerScore: 0,
      globalCompositePercentile: getGlobalCompositePercentile(detail, candidate)
    }
  }

  const globalCompositePercentile = getGlobalCompositePercentile(detail, candidate)
  const screenerScore = globalCompositePercentile ??
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

  const finalScore = clamp(
    screenerScore * 0.45 +
      technicalScore * 0.25 +
      momentumScore * 0.15 +
      sentimentScore * 0.1 +
      liquidityScore * 0.05,
    0,
    100
  )

  let action: TradeAdvisorAction = 'WAIT'
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

  return {
    action,
    score: Math.round(finalScore),
    reasons,
    screenerScore,
    globalCompositePercentile
  }
}
