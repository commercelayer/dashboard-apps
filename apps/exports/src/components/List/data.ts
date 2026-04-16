import {
  type ListExportContextState,
  type ListExportContextValue
} from './types'

export const initialState: ListExportContextState = {
  isLoading: true,
  isPolling: false,
  currentPage: 1
}

export const initialValues: ListExportContextValue = {
  state: initialState,
  changePage: () => undefined,
  deleteExport: async () => undefined,
  interruptExport: async () => undefined,
  resumeExport: async () => undefined
}
