/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 */

import type * as Types from '@app/server/Types.ts'

const dateIntRegex = /^\d{8}$/

export default class Utils {
  static queryString(raw: unknown): string | undefined {
    return typeof raw === 'string' ? raw : undefined
  }

  static parseNumber(value: string | undefined): number | undefined {
    if (value === undefined || value === '') {
      return undefined
    }
    const parsedNum = Number(value)
    return Number.isFinite(parsedNum) ? parsedNum : undefined
  }

  static parseBoolean(value: string | undefined): boolean {
    return value === '1' || value === 'true'
  }

  static parseWeight(value: string | undefined): number | undefined {
    if (value === undefined || value === '') {
      return undefined
    }
    const parsedNum = Number(value)
    return Number.isFinite(parsedNum) && parsedNum >= 0 ? parsedNum : undefined
  }

  static parseWeek(raw: string | undefined): 1 | 4 | 13 | 26 {
    if (raw === '1') {
      return 1
    }
    if (raw === '4') {
      return 4
    }
    if (raw === '13') {
      return 13
    }
    return 26
  }

  static queryParamSent(raw: unknown): boolean {
    return typeof raw === 'string'
  }

  static isNonEmptyString(value: string | null | undefined): value is string {
    return value != null && value.trim() !== ''
  }

  static toTitleCase(value: string | null | undefined): string | null {
    if (value == null || value.trim() === '') {
      return null
    }
    return value
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  static changePctFromPrevious(change: number | null, previous: number | null): number | null {
    const previousValue = previous != null ? Number(previous) : 0
    const changeValue = change != null ? Number(change) : null
    if (previousValue <= 0 || changeValue == null || !Number.isFinite(changeValue)) {
      return null
    }
    return Math.round((changeValue / previousValue) * 10000) / 100
  }

  static sectorPercentile(sectorRank: number, sectorCount: number): number {
    if (sectorCount <= 1) {
      return 100
    }
    return Math.round(((sectorCount - sectorRank + 1) / sectorCount) * 1000) / 1000
  }

  static compositePercentile(index: number, totalCount: number): number {
    if (totalCount <= 1) {
      return 100
    }
    return Math.round((1 - index / totalCount) * 1000) / 10
  }

  static round3(n: number): number {
    return Math.round(n * 1000) / 1000
  }

  static returnPctFromPrices(first: number, last: number): number | null {
    if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) {
      return null
    }
    return ((last - first) / first) * 100
  }

  static buildCompositeWeights(
    valueWeight: number | undefined,
    qualityWeight: number | undefined,
    momentumWeight: number | undefined
  ): Types.CompositeWeights | undefined {
    if (valueWeight === undefined && qualityWeight === undefined && momentumWeight === undefined) {
      return undefined
    }
    return {
      ...(valueWeight !== undefined && { valueWeight }),
      ...(qualityWeight !== undefined && { qualityWeight }),
      ...(momentumWeight !== undefined && { momentumWeight })
    }
  }

  static pushToMapList<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(value)
  }

  static toFundamentalsMap(
    rows: Types.FundamentalsRowInput[]
  ): Map<string, Types.FundamentalsValues> {
    const fundamentalsMap = new Map<string, Types.FundamentalsValues>()
    for (const row of rows) {
      fundamentalsMap.set(row.code, {
        per: row.per != null && Number.isFinite(Number(row.per)) ? Number(row.per) : null,
        roa: row.roa != null && Number.isFinite(Number(row.roa)) ? Number(row.roa) : null,
        roe: row.roe != null && Number.isFinite(Number(row.roe)) ? Number(row.roe) : null,
        der: row.der != null && Number.isFinite(Number(row.der)) ? Number(row.der) : null,
        week1PC: row.week1PC != null && Number.isFinite(Number(row.week1PC))
          ? Number(row.week1PC)
          : null,
        week4PC: row.week4PC != null && Number.isFinite(Number(row.week4PC))
          ? Number(row.week4PC)
          : null,
        week13PC: row.week13PC != null && Number.isFinite(Number(row.week13PC))
          ? Number(row.week13PC)
          : null,
        week26PC: row.week26PC != null && Number.isFinite(Number(row.week26PC))
          ? Number(row.week26PC)
          : null,
        week52PC: row.week52PC != null && Number.isFinite(Number(row.week52PC))
          ? Number(row.week52PC)
          : null,
        pbv: row.pbv != null && Number.isFinite(Number(row.pbv)) ? Number(row.pbv) : null,
        marketCapital: row.marketCapital != null && Number.isFinite(Number(row.marketCapital))
          ? Number(row.marketCapital)
          : null,
        npm: row.npm != null && Number.isFinite(Number(row.npm)) ? Number(row.npm) : null
      })
    }
    return fundamentalsMap
  }

  static screenerPassesFundamentalFilter(
    row: Types.FundamentalsValues,
    filter: Types.FundamentalFilter
  ): boolean {
    if (filter.perMin != null && (row.per == null || row.per < filter.perMin)) {
      return false
    }
    if (filter.perMax != null && (row.per == null || row.per > filter.perMax)) {
      return false
    }
    if (filter.roeMin != null && (row.roe == null || row.roe < filter.roeMin)) {
      return false
    }
    if (filter.derMax != null && (row.der == null || row.der > filter.derMax)) {
      return false
    }
    if (filter.pbvMax != null && (row.pbv == null || row.pbv > filter.pbvMax)) {
      return false
    }
    if (
      filter.minMarketCapital != null &&
      (row.marketCapital == null || row.marketCapital < filter.minMarketCapital)
    ) {
      return false
    }
    if (filter.netMarginMin != null && (row.npm == null || row.npm < filter.netMarginMin)) {
      return false
    }
    let momentumValue: number | null = null
    if (filter.momentumWeek === 1) {
      momentumValue = row.week1PC ?? null
    } else if (filter.momentumWeek === 4) {
      momentumValue = row.week4PC ?? null
    } else if (filter.momentumWeek === 13) {
      momentumValue = row.week13PC ?? null
    } else if (filter.momentumWeek === 26) {
      momentumValue = row.week26PC
    }
    if (
      filter.momentumMin != null &&
      (momentumValue == null || momentumValue < filter.momentumMin)
    ) {
      return false
    }
    return true
  }

  static parseDate(value: string | undefined): number | null {
    if (value === undefined || value === '' || !dateIntRegex.test(value)) {
      return null
    }
    return parseInt(value, 10)
  }

  static addDaysToDateInt(dateInt: number, deltaDays: number): number {
    const year = Math.floor(dateInt / 10000)
    const month = Math.floor((dateInt % 10000) / 100) - 1
    const day = dateInt % 100
    const date = new Date(year, month, day)
    date.setDate(date.getDate() + deltaDays)
    const resultYear = date.getFullYear()
    const resultMonth = String(date.getMonth() + 1).padStart(2, '0')
    const resultDay = String(date.getDate()).padStart(2, '0')
    return parseInt(`${resultYear}${resultMonth}${resultDay}`, 10)
  }

  static uniqueSorted(values: (string | null)[]): string[] {
    const set = new Set<string>()
    for (const entry of values) {
      if (entry != null && entry.trim() !== '') {
        set.add(entry.trim())
      }
    }
    return [...set].sort((first, second) => first.localeCompare(second))
  }

  static parseLimitOffset(
    limitRaw: string | undefined,
    offsetRaw: string | undefined,
    defaultLimit = 500,
    maxLimit = 1000
  ): Types.LimitOffset {
    const limitNum = limitRaw !== undefined &&
        limitRaw !== '' &&
        Number.isFinite(Number(limitRaw)) &&
        Number(limitRaw) >= 0
      ? Number(limitRaw)
      : null
    const offsetNum = offsetRaw !== undefined &&
        offsetRaw !== '' &&
        Number.isFinite(Number(offsetRaw)) &&
        Number(offsetRaw) >= 0
      ? Number(offsetRaw)
      : null
    const limit = Math.min(Math.max(0, limitNum ?? defaultLimit), maxLimit)
    const offset = Math.max(0, offsetNum ?? 0)
    return { limit, offset }
  }

  static applyPagination<T>(items: T[], offset: number, limit: number): Types.PaginationResult<T> {
    const totalCount = items.length
    const paginatedItems = items.slice(offset, offset + limit)
    return { data: paginatedItems, totalCount }
  }
}
