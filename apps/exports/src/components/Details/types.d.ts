import { type Export } from '@commercelayer/sdk'

declare module 'App' {
  export interface ExportDetailsContextValue {
    state: ExportDetailsContextState
    refetch: () => Promise<void>
    deleteExport: () => Promise<boolean>
  }

  export interface ExportDetailsContextState {
    data: Export
    isLoading: boolean
    isDeleting: boolean
    isPolling: boolean
    isNotFound: boolean
  }
}
