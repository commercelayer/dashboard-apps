import type {
  CommerceLayerClient,
  Export,
  ListResponse,
  QueryFilter,
  QueryParamsList
} from '@commercelayer/sdk'
import { type ListExportContextState, type ListExportContextValue } from 'App'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef
} from 'react'

import { useIsChanged } from '@commercelayer/app-elements'
import { initialState, initialValues } from './data'
import { reducer } from './reducer'

interface ListExportProviderProps {
  /**
   * Number of items to fetch/load per page.
   */
  pageSize: number
  /**
   * a valid SDK client
   */
  sdkClient: CommerceLayerClient
  /**
   * Inner content where context exists
   */
  children: ((props: ListExportContextValue) => ReactNode) | ReactNode
  /**
   * SDK filters object to apply to the list of exports.
   * This is optional and can be used to filter the exports based on specific criteria.
   */
  filters: QueryFilter
}
const POLLING_INTERVAL = 4000

const Context = createContext<ListExportContextValue>(initialValues)

export const useListContext = (): ListExportContextValue => useContext(Context)

export function ListExportProvider({
  children,
  pageSize,
  sdkClient,
  filters
}: ListExportProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const intervalId = useRef<number | null>(null)

  // update list when filters change
  useIsChanged({
    value: filters,
    onChange: () => {
      // Set the loading state to the first page
      dispatch({ type: 'changePage', payload: 1 })
      // Refresh the list with the new filters
      void getAllExports({
        cl: sdkClient,
        state,
        pageSize,
        filters
      }).then((list) => {
        dispatch({ type: 'loadData', payload: list })
      })
    }
  })

  const changePage = useCallback((page: number) => {
    dispatch({ type: 'changePage', payload: page })
  }, [])

  const fetchList = useCallback(async () => {
    const list = await getAllExports({
      cl: sdkClient,
      state,
      pageSize,
      filters
    })
    dispatch({ type: 'loadData', payload: list })
  }, [state.currentPage])

  const deleteExport = (exportId: string): void => {
    sdkClient.exports
      .delete(exportId)
      .then(fetchList)
      .catch(() => {
        console.error('Export not found')
      })
  }

  useEffect(
    function handleChangePageIgnoringFirstRender() {
      if (state.list?.meta.currentPage != null) {
        void fetchList()
      }
    },
    [state.currentPage]
  )

  useEffect(
    function init() {
      void fetchList()
      if (!state.isPolling) {
        return
      }
      // start polling
      intervalId.current = window.setInterval(() => {
        void fetchList()
      }, POLLING_INTERVAL)

      return () => {
        if (intervalId.current != null) {
          window.clearInterval(intervalId.current)
        }
      }
    },
    [state.isPolling]
  )

  const value: ListExportContextValue = {
    state,
    changePage,
    deleteExport
  }

  return (
    <Context.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </Context.Provider>
  )
}

const getAllExports = async ({
  cl,
  state,
  pageSize,
  filters
}: {
  cl: CommerceLayerClient
  state: ListExportContextState
  pageSize: number
  filters?: QueryFilter
}): Promise<ListResponse<Export>> => {
  return await cl.exports.list({
    pageNumber: state.currentPage,
    pageSize: pageSize as QueryParamsList<Export>['pageSize'],
    sort: { created_at: 'desc' },
    filters
  })
}
