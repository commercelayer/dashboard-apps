import { type Export } from '@commercelayer/sdk'
import { type ExportDetailsContextState } from 'App'

type Action =
  | { type: 'setLoading'; payload: boolean }
  | { type: 'setDeleting'; payload: boolean }
  | { type: 'setNotFound'; payload: boolean }
  | { type: 'setData'; payload: Export }
  | { type: 'togglePolling'; payload: boolean }

export const reducer = (
  state: ExportDetailsContextState,
  action: Action
): ExportDetailsContextState | never => {
  switch (action.type) {
    case 'setLoading':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'setDeleting':
      return {
        ...state,
        isDeleting: action.payload
      }
    case 'setNotFound':
      return {
        ...state,
        isNotFound: action.payload
      }
    case 'setData':
      return {
        ...state,
        data: action.payload
      }
    case 'togglePolling':
      return {
        ...state,
        isPolling: action.payload
      }
    default:
      return state
  }
}
