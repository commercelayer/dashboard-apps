import { makeExport } from "#mocks"
import type { ExportDetailsContextValue } from "./types"

export const initialValues: ExportDetailsContextValue = {
  state: {
    isLoading: true,
    isDeleting: false,
    isNotFound: false,
    data: makeExport(),
  },
  refetch: async () => undefined,
  deleteExport: async () => false,
}
