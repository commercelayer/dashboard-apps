import { type Import, type ListResponse } from '@commercelayer/sdk'
import { type ListImportContextState } from 'App'
import { listHasProgressingItems } from './utils'

type Action =
  | { type: 'loadData'; payload: ListResponse<Import> }
  | { type: 'changePage'; payload: number }

export const reducer = (
  state: ListImportContextState,
  action: Action
): ListImportContextState => {
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
