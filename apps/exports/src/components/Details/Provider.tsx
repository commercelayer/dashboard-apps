import { type Export } from '@commercelayer/sdk'
import { type ExportDetailsContextValue } from 'App'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef
} from 'react'
import { initialState, initialValues } from './data'
import { reducer } from './reducer'
import { useCoreSdkProvider } from '@commercelayer/app-elements'

interface ExportDetailsProviderProps {
  exportId: string
  children: ((props: ExportDetailsContextValue) => ReactNode) | ReactNode
}

const POLLING_INTERVAL = 4000

const Context = createContext<ExportDetailsContextValue>(initialValues)
export const useExportDetailsContext = (): ExportDetailsContextValue =>
  useContext(Context)

export function ExportDetailsProvider({
  exportId,
  children
}: ExportDetailsProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { sdkClient } = useCoreSdkProvider()
  const intervalId = useRef<number | null>(null)

  const fetchJob = useCallback(
    async ({ handleLoadingState }: { handleLoadingState: boolean }) => {
      handleLoadingState && dispatch({ type: 'setLoading', payload: true })
      try {
        const exportDetails = await sdkClient.exports.retrieve(exportId)
        dispatch({ type: 'setData', payload: exportDetails })
      } catch {
        dispatch({ type: 'setNotFound', payload: true })
        dispatch({ type: 'togglePolling', payload: false })
        dispatch({ type: 'setLoading', payload: false })
      }
      handleLoadingState && dispatch({ type: 'setLoading', payload: false })
    },
    [exportId]
  )

  const deleteExport = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'setDeleting', payload: true })
    return await sdkClient.exports
      .delete(exportId)
      .then(() => true)
      .catch(() => {
        dispatch({ type: 'setDeleting', payload: false })
        return false
      })
  }, [exportId])

  useEffect(
    function handlePollingState() {
      if (state.data?.status == null) {
        return
      }

      const shouldPoll = statusForPolling.includes(state.data.status)
      dispatch({ type: 'togglePolling', payload: shouldPoll })
    },
    [state.data]
  )

  useEffect(
    function startPolling() {
      void fetchJob({ handleLoadingState: true })
      if (!state.isPolling) {
        return
      }
      intervalId.current = window.setInterval(() => {
        void fetchJob({ handleLoadingState: false })
      }, POLLING_INTERVAL)

      return () => {
        if (intervalId.current != null) {
          window.clearInterval(intervalId.current)
        }
      }
    },
    [state.isPolling]
  )

  const value: ExportDetailsContextValue = {
    state,
    refetch: async () => {
      await fetchJob({ handleLoadingState: false })
    },
    deleteExport
  }

  return (
    <Context.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </Context.Provider>
  )
}

const statusForPolling: Array<Export['status']> = ['pending', 'in_progress']
