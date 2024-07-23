import type { Export, ListResponse } from '@commercelayer/sdk'
import type { ListExportContextState } from 'App'
import { listHasProgressingItems } from './utils'

type Action =
  | { type: 'loadData'; payload: ListResponse<Export> }
  | { type: 'changePage'; payload: number }

export const reducer = (
  state: ListExportContextState,
  action: Action
): ListExportContextState => {
  switch (action.type) {
    case 'loadData':
      return {
        ...state,
        isLoading: false,
        isPolling: listHasProgressingItems(action.payload),
        list: action.payload
      }
    case 'changePage':
      return {
        ...state,
        isLoading: true,
        currentPage: action.payload
      }
    default:
      return state
  }
}
