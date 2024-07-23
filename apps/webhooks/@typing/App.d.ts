declare module 'App' {
  export interface WebhookFormContextValue {
    refetch: () => Promise<void>
    state: WebhookFormContextState
  }

  export interface WebhookFormContextState {
    data?: Webhook
    isLoading: boolean
    isNotFound: boolean
  }
}
