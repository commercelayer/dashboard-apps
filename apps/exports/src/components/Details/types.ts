import { type Export } from '@commercelayer/sdk'

export interface ExportDetailsContextValue {
  state: ExportDetailsContextState
  refetch: () => Promise<void>
  deleteExport: () => Promise<boolean>
}

export interface ExportDetailsContextState {
  data: Export & {
    estimated_completion_at?: string
    progress?: number
  }
  isLoading: boolean
  isDeleting: boolean
  isPolling: boolean
  isNotFound: boolean
}
