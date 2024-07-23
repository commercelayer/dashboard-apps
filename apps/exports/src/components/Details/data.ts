import { makeExport } from '#mocks'
import {
  type ExportDetailsContextState,
  type ExportDetailsContextValue
} from 'App'

export const initialState: ExportDetailsContextState = {
  isLoading: true,
  isPolling: false,
  isDeleting: false,
  isNotFound: false,
  data: makeExport()
}

export const initialValues: ExportDetailsContextValue = {
  state: initialState,
  refetch: async () => undefined,
  deleteExport: async () => false
}
