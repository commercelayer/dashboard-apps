import {
  isMockedId,
  orderTransactionIsAnAsyncCapture,
  useCoreApi,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { useCallback } from "react"
import { hasPollableTransaction } from "#components/OrderPayment/paymentSessionUtils"
import { makeOrder } from "#mocks"

export const orderIncludeAttribute = [
  "market",
  // B2B: the agreement the order was placed under, if any, and the reviews
  // asking its buyer to confirm a change
  "agreement",
  "order_reviews",
  "customer",
  "customer.customer_addresses",
  "customer.customer_addresses.address",
  "line_items",
  "line_items.gift_card",
  "line_items.line_item_options",
  "shipping_address",
  "billing_address",
  "shipments",
  "shipments.line_items", // required to check returnable items for delivered shipments
  "shipments.stock_transfers",
  "shipments.parcels",
  "payment_method",
  "payment_source",
  "transactions",

  // payment sessions
  "available_payment_settings",
  "payment_sessions",
  "payment_sessions.payment_setting",
  "payment_sessions.payment_authorization",
  "payment_sessions.payment_captures",
  "payment_sessions.payment_void",
  "payment_sessions.payment_refunds",
  "payment_sessions.payment_transactions",

  // order editing
  "line_items.sku",
  "shipments.shipping_method",
  "shipments.available_shipping_methods",
  "shipments.stock_location",
  "shipments.shipping_method",
  "shipments.stock_line_items",
  "shipments.stock_line_items.sku",
]

export function useOrderDetails(id: string) {
  const { sdkClient } = useCoreSdkProvider()
  const {
    data: order,
    isLoading,
    mutate,
    isValidating,
    error,
  } = useCoreApi(
    "orders",
    "retrieve",
    !isMockedId(id) && !isEmpty(id)
      ? [
          id,
          {
            include: orderIncludeAttribute,
          },
        ]
      : null,
    {
      fallbackData: makeOrder(),
      refreshInterval: (order) => {
        // One condition per payment model, so legacy can be dropped alone.
        const hasLegacyAsyncCapture = (order?.transactions ?? []).some(
          orderTransactionIsAnAsyncCapture,
        )
        const hasUnsettledPaymentSession = (order?.payment_sessions ?? []).some(
          hasPollableTransaction,
        )

        return hasLegacyAsyncCapture || hasUnsettledPaymentSession ? 5000 : 0
      },
    },
  )

  /**
   * B2B: an order placed under an agreement does not refresh on its own
   * (`autorefresh` is off), so while it is edited its totals would stay the
   * ones from before the edit. Every edit action ends by reloading the order
   * with nothing handed in, so that reload refreshes it first. Meant to go once
   * Core keeps these totals up to date itself.
   */
  const mutateOrder = useCallback<typeof mutate>(
    async (...args) => {
      if (
        args[0] === undefined &&
        order?.status === "editing" &&
        order.agreement != null
      ) {
        // a failed refresh still reloads: Finish refreshes again before it
        // checks the payment
        await sdkClient.orders
          .update({ id: order.id, _refresh: true })
          .catch(() => undefined)
      }
      return await mutate(...args)
    },
    [mutate, order?.id, order?.status, order?.agreement, sdkClient],
  )

  return { order, isLoading, mutateOrder, isValidating, error }
}
