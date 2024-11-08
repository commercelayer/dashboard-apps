import type { UITriggerAttributes } from '#components/OrderSummary/orderDictionary'
import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  useCoreSdkProvider,
  type TriggerAttribute
} from '@commercelayer/app-elements'
import { CommerceLayerStatic, type OrderUpdate } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'
import { orderIncludeAttribute } from './useOrderDetails'

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (
    triggerAttribute:
      | TriggerAttribute<OrderUpdate>
      | Exclude<UITriggerAttributes, TriggerAttribute<OrderUpdate>>
  ) => Promise<void>
}

export function useTriggerAttribute(orderId: string): TriggerAttributeHook {
  const { order, mutateOrder } = useOrderDetails(orderId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback<TriggerAttributeHook['dispatch']>(
    async (triggerAttribute) => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        if (triggerAttribute === '__cancel_transactions') {
          for (const transaction of order.transactions ?? []) {
            if (
              transaction.type === 'authorizations' ||
              transaction.type === 'captures'
            ) {
              await sdkClient[transaction.type].update({
                id: transaction.id,
                _cancel: true
              })

              void mutateOrder()
            }
          }

          return
        }

        const updatedOrder = await sdkClient.orders.update(
          {
            id: orderId,
            [triggerAttribute]: true
          },
          {
            include: orderIncludeAttribute
          }
        )
        void mutateOrder(updatedOrder)
      } catch (error) {
        setErrors(
          CommerceLayerStatic.isApiError(error)
            ? error.errors.map(({ detail }) => detail)
            : ['Could not cancel this order']
        )
        await Promise.reject(error)
      } finally {
        setIsLoading(false)
      }
    },
    [orderId]
  )

  return {
    isLoading,
    errors,
    dispatch
  }
}
