import { useCoreApi, useCoreSdkProvider } from "@commercelayer/app-elements"
import type { Export } from "@commercelayer/sdk"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"
import { makeExport } from "#mocks"
import { initialValues } from "./data"
import type { ExportDetailsContextValue } from "./types"

interface ExportDetailsProviderProps {
  exportId: string
  children: ((props: ExportDetailsContextValue) => ReactNode) | ReactNode
}

const POLLING_INTERVAL = 4000
const statusForPolling: Array<Export["status"]> = ["pending", "in_progress"]

const Context = createContext<ExportDetailsContextValue>(initialValues)
export const useExportDetailsContext = (): ExportDetailsContextValue =>
  useContext(Context)

export function ExportDetailsProvider({
  exportId,
  children,
}: ExportDetailsProviderProps): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, error, isLoading, mutate } = useCoreApi(
    "exports",
    "retrieve",
    [exportId],
    {
      fallbackData: makeExport(),
      refreshInterval: (job) =>
        job?.status != null && statusForPolling.includes(job.status)
          ? POLLING_INTERVAL
          : 0,
    },
  )

  const deleteExport = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true)
    return await sdkClient.exports
      .delete(exportId)
      .then(() => true)
      .catch(() => {
        setIsDeleting(false)
        return false
      })
  }, [exportId, sdkClient])

  const value: ExportDetailsContextValue = {
    state: {
      data,
      isLoading,
      isDeleting,
      isNotFound: error != null,
    },
    refetch: async () => {
      await mutate()
    },
    deleteExport,
  }

  return (
    <Context.Provider value={value}>
      {typeof children === "function" ? children(value) : children}
    </Context.Provider>
  )
}
