import {
  type ListImportContextState,
  type ListImportContextValue
} from './types'

export const initialState: ListImportContextState = {
  isLoading: true,
  isPolling: false,
  currentPage: 1
}

export const initialValues: ListImportContextValue = {
  state: initialState,
  changePage: () => undefined,
  deleteImport: async () => undefined
}
