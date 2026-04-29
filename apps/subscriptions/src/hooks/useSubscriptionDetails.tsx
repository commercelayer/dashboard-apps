import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import { makeOrderSubscription } from "#mocks"

export const orderSubscriptionIncludeAttribute = [
  "market",
  "customer",
  "source_order",
  "source_order.billing_address",
  "source_order.shipping_address",
  "order_subscription_items",
  "order_subscription_items.sku",
  "order_subscription_items.bundle",
  "customer_payment_source.payment_source",
]

export function useSubscriptionDetails(id: string) {
  const {
    data: subscription,
    isLoading,
    error,
    mutate: mutateSubscription,
  } = useCoreApi(
    "order_subscriptions",
    "retrieve",
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: orderSubscriptionIncludeAttribute,
          },
        ],
    {
      fallbackData: makeOrderSubscription(),
    },
  )

  return { subscription, isLoading, error, mutateSubscription }
}
