import type { Webhook } from '@commercelayer/sdk'
import type { WebhookFormContextState } from 'App'

type Action =
  | { type: 'webhook/onError' }
  | { type: 'webhook/loaded'; payload: Webhook }

export const reducer = (
  state: WebhookFormContextState,
  action: Action
): WebhookFormContextState | never => {
  switch (action.type) {
    case 'webhook/onError':
      return {
        ...state,
        isNotFound: true,
        isLoading: false
      }
    case 'webhook/loaded':
      return {
        ...state,
        data: action.payload,
        isLoading: false
      }
    default:
      return state
  }
}
