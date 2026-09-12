/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import Database from '@app/server/Database.ts'
import * as Schemas from '@app/server/schemas/index.ts'
import * as Services from '@app/server/services/index.ts'
import type * as Types from '@app/server/services/Types.ts'
import { ZpiIdxClient } from '@app/server/services/ZpiIdxClient.ts'
import { ZpiTradingViewClient } from '@app/server/services/ZpiTradingViewClient.ts'

export class Summary {
  private static readonly stockSummaryUrl =
    'https://www.idx.co.id/primary/TradingSummary/GetStockSummary'

  static async run(client: Types.Client, dateInt: number): Promise<void> {
    const zpiClient = new ZpiIdxClient()
    const usingZpi = zpiClient.isConfigured()
    console.info(`[summary] fetching ${dateInt} via ${usingZpi ? 'ZPI' : 'IDX fallback'}`)

    const response = usingZpi
      ? await zpiClient.fetchStockSummary(dateInt)
      : await client.get(`${Summary.stockSummaryUrl}?date=${dateInt}`)
    if (!response.ok) {
      throw new Error(`Stock summary API ${response.status}`)
    }
    const apiResponse = (await response.json()) as Types.StockSummaryApiResponse
    const raw = apiResponse.data
    if (!Array.isArray(raw) || raw.length === 0) {
      console.info(`[summary] ZPI returned empty for ${dateInt}, trying TradingView fallback`)
      const tvItems = await Summary.fetchTradingViewFallback(dateInt)
      if (tvItems.length === 0) {
        console.info(`[summary] no data available for ${dateInt} from any source`)
        return
      }
      return Summary.writeItems(tvItems, dateInt)
    }
    const summaryItems: Types.StockSummaryItem[] = raw

    const validItems: typeof summaryItems = []
    let mismatchCount = 0
    for (const item of summaryItems) {
      const itemDateStr = item.Date ?? ''
      const itemDateInt = itemDateStr ? Services.CronDate.stringToDateInt(itemDateStr) : dateInt
      if (itemDateInt === dateInt) {
        validItems.push(item)
      } else {
        mismatchCount++
      }
    }

    if (mismatchCount > 0) {
      console.warn(
        `[summary] ${mismatchCount} items with mismatched dates for ${dateInt} (stale upstream data), skipped`
      )
    }
    if (validItems.length === 0) {
      console.info(`[summary] all ${summaryItems.length} items had mismatched dates for ${dateInt}, nothing to write`)
      return
    }

    return Summary.writeItems(validItems, dateInt)
  }

  private static async fetchTradingViewFallback(
    dateInt: number
  ): Promise<Types.StockSummaryItem[]> {
    const tvClient = new ZpiTradingViewClient()
    if (!tvClient.isConfigured()) {
      console.info(`[summary] ZPI TradingView client not configured, skipping fallback`)
      return []
    }
    const items: Types.StockSummaryItem[] = []
    let page = 1
    const pageSize = 500
    let hasMore = true
    while (hasMore) {
      console.info(`[summary] TradingView screener page ${page}`)
      let result: Awaited<ReturnType<ZpiTradingViewClient['fetchScreener']>>
      try {
        result = await tvClient.fetchScreener({
          market: 'indonesia',
          page,
          count: pageSize
        })
      } catch (err) {
        console.error(`[summary] TradingView screener fetch failed:`, err)
        break
      }
      if (!result.items || result.items.length === 0) {
        break
      }
      for (const item of result.items) {
        const previous = item.last - item.change
        items.push({
          Date: String(dateInt),
          StockCode: item.ticker,
          StockName: item.name,
          Remarks: item.exchange,
          Previous: previous || undefined,
          OpenPrice: undefined,
          FirstTrade: undefined,
          High: undefined,
          Low: undefined,
          Close: item.last,
          Change: item.change,
          Volume: item.volume,
          Value: undefined,
          Frequency: undefined,
          IndexIndividual: undefined,
          WeightForIndex: undefined,
          Offer: undefined,
          OfferVolume: undefined,
          Bid: undefined,
          BidVolume: undefined,
          ListedShares: item.marketCap || undefined,
          TradebleShares: undefined,
          ForeignBuy: undefined,
          ForeignSell: undefined
        })
      }
      hasMore = result.hasMore
      page++
    }
    console.info(`[summary] TradingView fallback returned ${items.length} items`)
    return items
  }

  private static async writeItems(items: Types.StockSummaryItem[], dateInt: number): Promise<void> {
    console.info(`[summary] writing ${items.length} items for ${dateInt}`)
    await Database.transaction(async (tx) => {
      for (const summaryItem of items) {
        const stockCode = summaryItem.StockCode ?? ''
        if (!stockCode) {
          continue
        }
        const id = `${dateInt}-${stockCode}`
        const row: typeof Schemas.summary.$inferInsert = {
          id,
          date: dateInt,
          stockCode,
          stockName: summaryItem.StockName ?? undefined,
          remarks: summaryItem.Remarks ?? undefined,
          previous: summaryItem.Previous ?? undefined,
          firstTrade: summaryItem.FirstTrade ?? undefined,
          priceOpen: summaryItem.OpenPrice ?? undefined,
          priceHigh: summaryItem.High ?? undefined,
          priceLow: summaryItem.Low ?? undefined,
          priceClose: summaryItem.Close ?? undefined,
          change: summaryItem.Change ?? undefined,
          volume: summaryItem.Volume ?? undefined,
          value: summaryItem.Value ?? undefined,
          frequency: summaryItem.Frequency ?? undefined,
          individualIndex: summaryItem.IndexIndividual ?? undefined,
          weightForIndex: summaryItem.WeightForIndex ?? undefined,
          offerValue: summaryItem.Offer ?? undefined,
          offerVolume: summaryItem.OfferVolume ?? undefined,
          bidValue: summaryItem.Bid ?? undefined,
          bidVolume: summaryItem.BidVolume ?? undefined,
          listedShares: summaryItem.ListedShares ?? undefined,
          tradableShares: summaryItem.TradebleShares ?? undefined,
          foreignBuy: summaryItem.ForeignBuy ?? undefined,
          foreignSell: summaryItem.ForeignSell ?? undefined
        }
        await tx
          .insert(Schemas.summary)
          .values(row)
          .onConflictDoUpdate({
            target: Schemas.summary.id,
            set: {
              stockName: row.stockName,
              remarks: row.remarks,
              previous: row.previous,
              firstTrade: row.firstTrade,
              priceOpen: row.priceOpen,
              priceHigh: row.priceHigh,
              priceLow: row.priceLow,
              priceClose: row.priceClose,
              change: row.change,
              volume: row.volume,
              value: row.value,
              frequency: row.frequency,
              individualIndex: row.individualIndex,
              weightForIndex: row.weightForIndex,
              offerValue: row.offerValue,
              offerVolume: row.offerVolume,
              bidValue: row.bidValue,
              bidVolume: row.bidVolume,
              listedShares: row.listedShares,
              tradableShares: row.tradableShares,
              foreignBuy: row.foreignBuy,
              foreignSell: row.foreignSell
            }
          })
      }
    })
  }
}
