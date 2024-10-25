import { isMockedId, makeOrderSubscription } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'

export const orderSubscriptionIncludeAttribute = ['last_event_callbacks']

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderSubscriptionDetails(id: string) {
  const {
    data: orderSubscription,
    isLoading,
    mutate: mutateOrderSubscription,
    isValidating
  } = useCoreApi(
    'order_subscriptions',
    'retrieve',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: orderSubscriptionIncludeAttribute
          }
        ],
    {
      fallbackData: makeOrderSubscription()
    }
  )

  return { orderSubscription, isLoading, mutateOrderSubscription, isValidating }
}
