import {
  type ImportDetailsContextState,
  type ImportDetailsContextValue
} from 'App'
import { makeImport } from '#mocks'

export const initialState: ImportDetailsContextState = {
  isLoading: true,
  isPolling: false,
  isDeleting: false,
  isNotFound: false,
  data: makeImport()
}

export const initialValues: ImportDetailsContextValue = {
  state: initialState,
  refetch: async () => undefined,
  deleteImport: async () => false
}
