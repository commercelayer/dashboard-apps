import type { Export, ListResponse } from '@commercelayer/sdk'

declare module 'App' {
  export interface ListExportContextValue {
    state: ListExportContextState
    changePage: (page: number) => void
    deleteExport: (id: string) => void
  }

  export interface ListExportContextState {
    list?: ListResponse<Export>
    isLoading: boolean
    isPolling: boolean
    currentPage: number
  }
}
