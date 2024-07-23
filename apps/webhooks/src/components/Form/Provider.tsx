import { useCoreSdkProvider } from '@commercelayer/app-elements'
import type { WebhookFormContextValue } from 'App'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer
} from 'react'
import { initialState, initialValues } from './data'
import { reducer } from './reducer'

interface WebhookFormProviderProps {
  webhookId: string
  children:
    | ((props: WebhookFormContextValue) => React.ReactNode)
    | React.ReactNode
}

const Context = createContext<WebhookFormContextValue>(initialValues)
export const useWebhookFormContext = (): WebhookFormContextValue =>
  useContext(Context)

export function WebhookFormProvider({
  webhookId,
  children
}: WebhookFormProviderProps): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchJob = useCallback(async () => {
    try {
      const webhook = await sdkClient.webhooks.retrieve(webhookId)
      dispatch({ type: 'webhook/loaded', payload: webhook })
    } catch {
      dispatch({ type: 'webhook/onError' })
    }
  }, [webhookId])

  useEffect(function init() {
    void fetchJob()
  }, [])

  const value: WebhookFormContextValue = {
    state,
    refetch: async () => {
      await fetchJob()
    }
  }

  return (
    <Context.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </Context.Provider>
  )
}
