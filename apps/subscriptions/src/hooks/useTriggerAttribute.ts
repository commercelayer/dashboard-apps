import type { getOrderSubscriptionTriggerActionName } from '#data/dictionaries'
import {
  orderSubscriptionIncludeAttribute,
  useOrderSubscriptionDetails
} from '#hooks/useOrderSubscriptionDetails'
import { useCoreSdkProvider } from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

type UITriggerAttributes = Parameters<
  typeof getOrderSubscriptionTriggerActionName
>[0]

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (triggerAttribute: UITriggerAttributes) => Promise<void>
}

export function useTriggerAttribute(
  orderSubscriptionId: string
): TriggerAttributeHook {
  const { mutateOrderSubscription } =
    useOrderSubscriptionDetails(orderSubscriptionId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback(
    async (triggerAttribute: string): Promise<void> => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        const updatedOrderSubscription =
          await sdkClient.order_subscriptions.update(
            {
              id: orderSubscriptionId,
              [triggerAttribute]: true
            },
            {
              include: orderSubscriptionIncludeAttribute
            }
          )
        void mutateOrderSubscription(updatedOrderSubscription)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this orderSubscription']
        )
      } finally {
        setIsLoading(false)
      }
    },
    [orderSubscriptionId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
