import type { Import, ListResponse } from '@commercelayer/sdk'

declare module 'App' {
  export interface ListImportContextValue {
    state: ListImportContextState
    changePage: (page: number) => void
    deleteImport: (importId: string) => Promise<void>
  }

  export interface ListImportContextState {
    list?: ListResponse<Import>
    isLoading: boolean
    isPolling: boolean
    currentPage: number
  }
}
