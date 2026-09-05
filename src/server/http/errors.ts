/**
 * Copyright (c) 2026 IDX Screener by @NeaByteLab (https://neabyte.com)
 * SPDX-License-Identifier: MIT
 *
 * Open to remote work & consulting.
 * Fullstack developer with a focus on security and experience in trading systems.
 *
 * Shared typed API error: every non-2xx response uses the shape
 * `{ error: { code, message, requestId } }`.
 */

export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
  }

  static badRequest(code: string, message: string): ApiError {
    return new ApiError(400, code, message)
  }

  static notFound(code: string, message: string): ApiError {
    return new ApiError(404, code, message)
  }

  static conflict(code: string, message: string): ApiError {
    return new ApiError(409, code, message)
  }

  static tooManyRequests(code: string, message: string): ApiError {
    return new ApiError(429, code, message)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
