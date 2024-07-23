import { type Import } from '@commercelayer/sdk'

declare module 'App' {
  export interface ImportDetailsContextValue {
    state: ImportDetailsContextState
    refetch: () => Promise<void>
    deleteImport: () => Promise<boolean>
  }

  export interface ImportDetailsContextState {
    data: Import
    isLoading: boolean
    isDeleting: boolean
    isPolling: boolean
    isNotFound: boolean
  }
}
