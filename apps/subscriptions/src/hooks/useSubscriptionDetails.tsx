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
  // 2026-05+ replaces `customer_payment_source` with a stored wallet: the
  // setting says which gateway, the wallet carries the card.
  "payment_wallet",
  "payment_wallet.payment_setting",
  // Recorded instead of a wallet when the gateway cannot vault a card. The
  // same record is included through the source order's session too, because
  // only there does core serialize the STI subclass that names the gateway.
  "payment_setting",
  "source_order.payment_sessions.payment_setting",
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
