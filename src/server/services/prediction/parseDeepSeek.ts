/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Robust parser for the DeepSeek JSON output contract. The model is asked for
 * strict JSON, but responses can still arrive fenced, with trailing prose, or
 * partially invalid — every field degrades to null instead of throwing.
 */

import { clamp } from '@app/server/services/prediction/numbers.ts'

export type DeepSeekRecommendation = 'bullish' | 'neutral' | 'bearish'

export type ParsedDeepSeekOutput = {
  label: DeepSeekRecommendation | null
  bullishProbability: number | null
  targetPrice: number | null
  stopLoss: number | null
  horizonDays: number | null
  reasons: string[]
  riskWarnings: string[]
  confidenceScore: number | null
  disclaimer: string | null
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
    .slice(0, 20)
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function parseLabel(value: unknown): DeepSeekRecommendation | null {
  if (value === 'bullish' || value === 'neutral' || value === 'bearish') {
    return value
  }
  return null
}

/**
 * Extracts the first JSON object from raw model output: strips code fences and
 * scans from the first `{` to the last `}`, tolerating prose around the JSON.
 */
export function extractJsonObject(raw: string): unknown {
  const withoutFences = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
  const firstBrace = withoutFences.indexOf('{')
  const lastBrace = withoutFences.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('no JSON object found')
  }
  return JSON.parse(withoutFences.slice(firstBrace, lastBrace + 1))
}

export function parseDeepSeek(rawContent: string | null | undefined): ParsedDeepSeekOutput {
  const empty: ParsedDeepSeekOutput = {
    label: null,
    bullishProbability: null,
    targetPrice: null,
    stopLoss: null,
    horizonDays: null,
    reasons: [],
    riskWarnings: [],
    confidenceScore: null,
    disclaimer: null
  }
  if (rawContent == null || rawContent.trim() === '') {
    return empty
  }
  let parsed: unknown
  try {
    parsed = extractJsonObject(rawContent)
  } catch {
    return empty
  }
  if (parsed == null || typeof parsed !== 'object') {
    return empty
  }
  const record = parsed as Record<string, unknown>

  const probability = toFiniteNumber(record.bullishProbability)
  const confidence = toFiniteNumber(record.confidenceScore)
  const horizon = toFiniteNumber(record.horizonDays)

  return {
    label: parseLabel(record.label),
    bullishProbability: probability != null ? clamp(probability, 0, 100) : null,
    targetPrice: toFiniteNumber(record.targetPrice),
    stopLoss: toFiniteNumber(record.stopLoss),
    horizonDays:
      horizon != null && Number.isInteger(horizon) && horizon >= 1 && horizon <= 365
        ? horizon
        : null,
    reasons: toStringArray(record.reasons),
    riskWarnings: toStringArray(record.riskWarnings),
    confidenceScore: confidence != null ? clamp(confidence, 0, 100) : null,
    disclaimer: toStringOrNull(record.disclaimer)
  }
}
