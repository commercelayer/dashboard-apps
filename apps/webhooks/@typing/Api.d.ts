declare module 'App' {
  export interface ApiError {
    code?: string
    detail: string
    meta?: unknown
    source?: unknown
    status?: string
    title: string
  }
}
