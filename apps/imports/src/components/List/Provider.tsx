import { useTokenProvider } from '@commercelayer/app-elements'
import { type TokenProviderAuthUser } from '@commercelayer/app-elements/dist/providers/TokenProvider/types'
import {
  type CommerceLayerClient,
  type Import,
  type ListResponse,
  type QueryParamsList
} from '@commercelayer/sdk'
import { type ListImportContextState, type ListImportContextValue } from 'App'
import { isAdmin } from 'dashboard-apps-common/src/utils/userUtils'
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
}
const POLLING_INTERVAL = 4000

const Context = createContext<ListImportContextValue>(initialValues)

export const useListContext = (): ListImportContextValue => useContext(Context)

export function ListImportProvider({
  children,
  pageSize,
  sdkClient
}: ListImportProviderProps): JSX.Element {
  const { user } = useTokenProvider()
  const [state, dispatch] = useReducer(reducer, initialState)
  const intervalId = useRef<number | null>(null)

  const changePage = useCallback((page: number) => {
    dispatch({ type: 'changePage', payload: page })
  }, [])

  const fetchList = useCallback(async () => {
    const list = await getAllImports({
      cl: sdkClient,
      state,
      pageSize,
      user
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
  user
}: {
  cl: CommerceLayerClient
  state: ListImportContextState
  pageSize: number
  user: TokenProviderAuthUser | null
}): Promise<ListResponse<Import>> => {
  return await cl.imports.list({
    pageNumber: state.currentPage,
    pageSize: pageSize as QueryParamsList<Import>['pageSize'],
    sort: { created_at: 'desc' },
    filters: isAdmin(user, import.meta.env.PUBLIC_TEST_USERS)
      ? {}
      : {
          metadata_jcont: { email: user?.email ?? '' }
        }
  })
}
