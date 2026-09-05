/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Thin candidate controller: parse -> load -> score -> filter -> paginate ->
 * optional sentiment -> respond. All transforms live in
 * services/candidates/Scoring.ts and are covered by fixture tests.
 */

import type { Context } from '@neabyte/deserve'
import Utils from '@app/server/Utils.ts'
import * as Services from '@app/server/services/index.ts'
import * as Scoring from '@app/server/services/candidates/Scoring.ts'
import { SentimentService } from '@app/server/services/candidates/SentimentService.ts'
import { parseCandidateQuery } from '@app/server/use-cases/candidates/queryParser.ts'
import { loadMarketData } from '@app/server/repositories/StockMarketDataRepository.ts'
import type * as Types from '@app/server/Types.ts'

export async function GET(ctx: Context) {
  const dateParsed = Utils.parseDate(Utils.queryString(ctx.query('date')))
  const dateInt = dateParsed ?? Services.CronDate.todayDateInt()

  const params = parseCandidateQuery((name) => ctx.query(name))
  const bundle = await loadMarketData(dateInt)

  const fundamentalFilter = {
    ...(params.perMin != null && { perMin: params.perMin }),
    ...(params.perMax != null && { perMax: params.perMax }),
    ...(params.roeMin != null && { roeMin: params.roeMin }),
    ...(params.derMax != null && { derMax: params.derMax }),
    ...(params.pbvMax != null && { pbvMax: params.pbvMax }),
    ...(params.minMarketCapital != null && { minMarketCapital: params.minMarketCapital }),
    ...(params.netMarginMin != null && { netMarginMin: params.netMarginMin }),
    ...(params.momentumMin != null && { momentumMin: params.momentumMin }),
    momentumWeek: params.momentumWeek
  }
  const screenerRowsWithShortMomentum = bundle.screenerRows.map((row) => ({
    ...row,
    week1PC: bundle.codeToReturnByWeek.get(row.code)?.get(1) ?? null,
    week4PC: bundle.codeToReturnByWeek.get(row.code)?.get(4) ?? row.week4PC,
    week13PC: bundle.codeToReturnByWeek.get(row.code)?.get(13) ?? row.week13PC,
    week26PC: bundle.codeToReturnByWeek.get(row.code)?.get(26) ?? row.week26PC
  }))
  const filteredScreenerRows = screenerRowsWithShortMomentum.filter((row) =>
    Utils.screenerPassesFundamentalFilter(row, fundamentalFilter)
  )
  const rowsForScore: Types.ScreenerRow[] = filteredScreenerRows.map((row) => ({
    code: row.code,
    name: row.name,
    sector: row.sector,
    per: row.per,
    pbv: row.pbv,
    roa: row.roa,
    roe: row.roe,
    der: row.der,
    week1PC: row.week1PC,
    week4PC: row.week4PC,
    week13PC: row.week13PC,
    week26PC: row.week26PC,
    week52PC: row.week52PC
  }))
  const rankedRows = Services.Composite.computeRanked(rowsForScore, params.compositeWeights)
  const codeToFlags = new Map<string, Types.CodeFlags>()
  for (const row of filteredScreenerRows) {
    codeToFlags.set(row.code, {
      notation: row.notation,
      corpAction: row.corpAction,
      umaDate: row.umaDate
    })
  }
  const codeToFundamentals = Utils.toFundamentalsMap(filteredScreenerRows)
  const codeToMarketCapital = new Map<string, number | null>()
  for (const row of filteredScreenerRows) {
    codeToMarketCapital.set(row.code, row.marketCapital ?? null)
  }

  const merged = Scoring.mergeScreenerAndTechnical(rankedRows, {
    codeToFlags,
    codeToLiquidity: bundle.codeToLiquidity,
    codeToFundamentals,
    codeToMarketCapital,
    codeToChangePct: bundle.codeToChangePct,
    codeToTechnical: bundle.codeToTechnical
  })
  const enhanced = Scoring.enhanceCandidates(merged, {
    codeToAvgVolume20: bundle.codeToAvgVolume20,
    codeToAvgValue20: bundle.codeToAvgValue20,
    rankedRows,
    rowsForScore,
    momentumWeek: params.momentumWeek
  })

  let filteredCandidates: Types.CandidateRow[] | Types.CandidateRowWithSectorRank[] =
    Scoring.applySignalFilters(enhanced, {
      relativeStrengthMin: params.relativeStrengthMin,
      smartMoneyOnly: params.smartMoneyOnly,
      requireBullishTrend: params.requireBullishTrend,
      requireEarlyReversal: params.requireEarlyReversal
    })
  if (params.withSectorRank) {
    filteredCandidates = Scoring.applySectorRanks(filteredCandidates)
  }
  filteredCandidates = Scoring.applyExclusionFilters(filteredCandidates, {
    excludeNotation: params.excludeNotation,
    excludeCorpAction: params.excludeCorpAction,
    excludeUma: params.excludeUma,
    minValue: params.minValue,
    minVolume: params.minVolume,
    setup: params.setup
  })
  filteredCandidates = Scoring.applySetupMapping(
    filteredCandidates,
    params.setup,
    params.includeRejected
  )
  filteredCandidates = Scoring.sortCandidates(filteredCandidates, params.setup)
  filteredCandidates = Scoring.applySectorAndSearchFilters(
    filteredCandidates,
    params.sector,
    params.search
  )
  const totalCount = filteredCandidates.length
  filteredCandidates = Scoring.finalRankingSort(filteredCandidates)
  const withPercentile = filteredCandidates.map((row, index) => ({
    ...row,
    compositePercentile: Utils.compositePercentile(index, totalCount)
  }))
  const { data } = Utils.applyPagination(withPercentile, params.offset, params.limit)
  const dataWithSentiment: Types.CandidateRow[] = data

  // If requested, fetch news sentiment for the paginated items only to limit external calls
  if (params.requireNewsSentiment) {
    const sentimentService = new SentimentService()
    await Promise.all(dataWithSentiment.map(async (row) => {
      try {
        const { score, count, label, titles } = await sentimentService.scoreCompany(
          row.code,
          row.name
        ) // attach to row
        row.newsSentimentScore = score
        row.newsSentimentCount = count
        row.newsSentimentLabel = label
        row.newsSentimentTitles = titles
        if (count === 0) {
          console.info(`[candidates] no news articles for ${row.code}`)
        }
      } catch (_e) {
        row.newsSentimentScore = 0
        row.newsSentimentCount = 0
        row.newsSentimentLabel = 'neutral'
        row.newsSentimentTitles = []
      }
    }))
    if (params.minNewsSentiment != null) {
      // filter rows by minNewsSentiment threshold
      for (let i = dataWithSentiment.length - 1; i >= 0; i--) {
        const s = dataWithSentiment[i]?.newsSentimentScore ?? 0
        if (s < params.minNewsSentiment) {
          dataWithSentiment.splice(i, 1)
        }
      }
    }
  }
  const response: Types.CandidatesResponse = {
    date: bundle.summaryDate,
    totalCount,
    limit: params.limit,
    offset: params.offset,
    serverTimestamp: new Date().toISOString(),
    data: dataWithSentiment
  }
  return ctx.send.json(response)
}
