import {
  isMockedId,
  orderTransactionIsAnAsyncCapture,
  useCoreApi,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { hasPollableTransaction } from "#components/OrderPayment/paymentSessionUtils"
import { makeOrder } from "#mocks"

export const orderIncludeAttribute = [
  "market",
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

  // payment sessions (API version 2026-05+)
  "payment_sessions",
  "payment_sessions.payment_setting",
  "payment_sessions.payment_authorization",
  "payment_sessions.payment_captures",
  "payment_sessions.payment_void",
  "payment_sessions.payment_refunds",
  "payment_sessions.payment_transactions",
  "payment_sessions.events",

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
  const {
    data: order,
    isLoading,
    mutate: mutateOrder,
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
        // Two independent conditions, one per payment model, so dropping the
        // legacy one later is deleting a clause rather than untangling a
        // shared helper.
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

  return { order, isLoading, mutateOrder, isValidating, error }
}
