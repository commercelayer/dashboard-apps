import {
  type CommerceLayerClient,
  type Import,
  type ListResponse,
  type QueryFilter,
  type QueryParamsList
} from '@commercelayer/sdk'
import { type ListImportContextState, type ListImportContextValue } from 'App'
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

interface ListImportProviderProps {
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
  children: ((props: ListImportContextValue) => ReactNode) | ReactNode
  /**
   * SDK filters object to apply to the list of imports.
   * This is optional and can be used to filter the imports based on specific criteria.
   */
  filters?: QueryFilter
}
const POLLING_INTERVAL = 4000

const Context = createContext<ListImportContextValue>(initialValues)

export const useListContext = (): ListImportContextValue => useContext(Context)

export function ListImportProvider({
  children,
  pageSize,
  sdkClient,
  filters
}: ListImportProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const intervalId = useRef<number | null>(null)

  // update list when filters change
  useIsChanged({
    value: filters,
    onChange: () => {
      // Set the loading state to the first page
      dispatch({ type: 'changePage', payload: 1 })
      // Refresh the list with the new filters
      void getAllImports({
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
    const list = await getAllImports({
      cl: sdkClient,
      state,
      pageSize,
      filters
    })
    dispatch({ type: 'loadData', payload: list })
  }, [state.currentPage])

  const deleteImport: ListImportContextValue['deleteImport'] = useCallback(
    async (importId: string) => {
      await sdkClient.imports.delete(importId).then(fetchList)
    },
    []
  )

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

  const value: ListImportContextValue = {
    state,
    changePage,
    deleteImport
  }

  return (
    <Context.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </Context.Provider>
  )
}

const getAllImports = async ({
  cl,
  state,
  pageSize,
  filters
}: {
  cl: CommerceLayerClient
  state: ListImportContextState
  pageSize: number
  filters?: QueryFilter
}): Promise<ListResponse<Import>> => {
  return await cl.imports.list({
    pageNumber: state.currentPage,
    pageSize: pageSize as QueryParamsList<Import>['pageSize'],
    sort: { created_at: 'desc' },
    filters
  })
}
