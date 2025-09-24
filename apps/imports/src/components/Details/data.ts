import { makeImport } from '#mocks'
import {
  type ImportDetailsContextState,
  type ImportDetailsContextValue
} from './types'

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
