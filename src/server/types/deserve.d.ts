declare module '@neabyte/deserve' {
  export interface Context {
    request: Request
    pathname: string
    requestId: string
    body: unknown
    query(name: string): string | undefined
    param(name: string): string | undefined
    send: {
      json(body: unknown, init?: { status?: number }): void
      html(body: string, init?: { status?: number }): void
    }
  }
}
