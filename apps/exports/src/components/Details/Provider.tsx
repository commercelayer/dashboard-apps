import { useCoreSdkProvider } from "@commercelayer/app-elements"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"
import { useExportDetails } from "#hooks/useExportDetails"
import { initialValues } from "./data"
import type { ExportDetailsContextValue } from "./types"

interface ExportDetailsProviderProps {
  exportId: string
  children: ((props: ExportDetailsContextValue) => ReactNode) | ReactNode
}

const Context = createContext<ExportDetailsContextValue>(initialValues)
export const useExportDetailsContext = (): ExportDetailsContextValue =>
  useContext(Context)

export function ExportDetailsProvider({
  exportId,
  children,
}: ExportDetailsProviderProps): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, error, isLoading, mutate } = useExportDetails(exportId)

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
