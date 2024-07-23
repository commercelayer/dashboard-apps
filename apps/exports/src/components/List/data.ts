import { type ListExportContextValue, type ListExportContextState } from 'App'

export const initialState: ListExportContextState = {
  isLoading: true,
  isPolling: false,
  currentPage: 1
}

export const initialValues: ListExportContextValue = {
  state: initialState,
  changePage: () => undefined,
  deleteExport: () => undefined
}
