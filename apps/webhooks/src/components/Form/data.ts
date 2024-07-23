import type { WebhookFormContextState, WebhookFormContextValue } from 'App'

export const initialState: WebhookFormContextState = {
  isLoading: true,
  isNotFound: false
}

export const initialValues: WebhookFormContextValue = {
  state: initialState,
  refetch: async () => undefined
}
