import {
  parseApiError,
  type TriggerAttribute,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { OrderUpdate } from "@commercelayer/sdk"
import { useCallback, useState } from "react"
import {
  getVoidableSessions,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import type { UITriggerAttributes } from "#components/OrderSummary/orderDictionary"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { orderIncludeAttribute } from "./useOrderDetails"

interface TriggerAttributeHook {
  isLoading: boolean
  errors?: string[]
  dispatch: (
    triggerAttribute:
      | TriggerAttribute<OrderUpdate>
      | Exclude<UITriggerAttributes, TriggerAttribute<OrderUpdate>>,
  ) => Promise<void>
}

export function useTriggerAttribute(orderId: string): TriggerAttributeHook {
  const { order, mutateOrder } = useOrderDetails(orderId)
  const { sdkClient } = useCoreSdkProvider()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[] | undefined>()

  const dispatch = useCallback<TriggerAttributeHook["dispatch"]>(
    async (triggerAttribute) => {
      setIsLoading(true)
      setErrors(undefined)
      try {
        // New model: cancelling the transactions voids each voidable session.
        if (
          isNewPaymentModel(order) &&
          triggerAttribute === "__cancel_transactions"
        ) {
          for (const session of getVoidableSessions(order)) {
            const authorization = session.payment_authorization
            if (authorization == null) continue
            await sdkClient.payment_voids.create({
              payment_session: { id: session.id, type: "payment_sessions" },
              payment_authorization: {
                id: authorization.id,
                type: "payment_authorizations",
              },
            })
          }
          void mutateOrder()
          return
        }

        if (triggerAttribute === "__cancel_transactions") {
          for (const transaction of order.transactions ?? []) {
            if (
              transaction.type === "authorizations" ||
              transaction.type === "captures"
            ) {
              await sdkClient[transaction.type].update({
                id: transaction.id,
                _cancel: true,
              })

              void mutateOrder()
            }
          }

          return
        }

        const updatedOrder = await sdkClient.orders.update(
          {
            id: orderId,
            [triggerAttribute]: true,
          },
          {
            include: orderIncludeAttribute,
          },
        )
        void mutateOrder(updatedOrder)
      } catch (error) {
        setErrors(
          parseApiError(error, "Could perform the requested action")?.map(
            ({ detail }) => detail,
          ),
        )
        await Promise.reject(error)
      } finally {
        setIsLoading(false)
      }
    },
    [orderId],
  )

  return {
    isLoading,
    errors,
    dispatch,
  }
}
