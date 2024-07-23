declare module 'App' {
  export interface ApiError {
    code?: string
    meta?: unknown
    source?: unknown
    status?: string
    /**
     * Error message without attribute key (Eg: "Must be set")
     */
    title: string
    /**
     * Computed error message that also includes attribute key (Eg: "Name - Must be set")
     */
    detail: string
  }
}
