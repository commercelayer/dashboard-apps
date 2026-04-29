import type { Export, ListResponse } from "@commercelayer/sdk"

export interface ListExportContextValue {
  state: ListExportContextState
  changePage: (page: number) => void
  deleteExport: (id: string) => Promise<void>
  interruptExport: (id: string) => Promise<void>
  resumeExport: (id: string) => Promise<void>
}

export interface ListExportContextState {
  list?: ListResponse<Export>
  isLoading: boolean
  isPolling: boolean
  currentPage: number
}
