/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Hourly ingestion: IDX screener + daily summaries, then forex/metals top-up
 * from Yahoo Finance, then outcome evaluation. Runs inside the Express process
 * when ENABLE_INGESTION_CRON=true.
 */

import * as Services from '@app/server/services/index.ts'
import { InstrumentService } from '@app/server/services/InstrumentService.ts'
import { OutcomeEvaluationJob } from '@app/server/jobs/OutcomeEvaluationJob.ts'

function sleepMs(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

export class IngestJob {
  static async run(): Promise<void> {
    console.info('[ingest] start: IDX screener + summaries')
    const fetcher = new Services.Fetcher()
    await fetcher.run()

    console.info('[ingest] forex/metals top-up')
    const instruments = await InstrumentService.list()
    for (const instrument of instruments) {
      try {
        await InstrumentService.ensureFresh(instrument.symbol)
      } catch (error) {
        console.error(`[ingest] forex top-up failed for ${instrument.symbol}:`, error)
      }
      // Space requests out to stay friendly to the provider.
      await sleepMs(1500)
    }

    console.info('[ingest] outcome evaluation')
    await OutcomeEvaluationJob.run()

    console.info('[ingest] done')
  }
}
