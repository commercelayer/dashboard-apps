import {
  type CurrencyCode,
  formatCentsToCurrency,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { LineItem, Order } from "@commercelayer/sdk"
import {
  getOrderPaymentTotals,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import { arrayOf } from "../utils"

export function useOrderStatus(order: Order) {
  const { canUser } = useTokenProvider()

  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | null
    | undefined

  const isPendingWithTransactions =
    order.payment_status !== "unpaid" && order.status === "pending"

  const isEditing =
    (order.status === "editing" ||
      order.status === "draft" ||
      order.status === "pending") &&
    canUser("update", "orders") &&
    !isPendingWithTransactions

  const diffTotalAndPlacedTotal =
    (order.total_amount_with_taxes_cents ?? 0) -
    (order.place_total_amount_cents ?? 0)

  /**
   * Legacy only: core refuses `stop_editing` above the amount the order was
   * placed at (`within_placed_total_amount?`), so the dashboard mirrors it.
   */
  const isOriginalOrderAmountExceeded =
    order.status === "editing" &&
    !isNewPaymentModel(order) &&
    diffTotalAndPlacedTotal > 0

  /**
   * New model: core dropped that check (`stop_editing_amount_check?` returns
   * early on `new_payments?`), so the placed total no longer means anything
   * here. What decides whether the edit can be finished is whether the order
   * is funded: an order edited upwards is fine once the customer has paid or
   * authorized the difference. Holds count, since the capture happens on
   * approval.
   */
  const toCollectCents =
    order.status === "editing" && isNewPaymentModel(order)
      ? getOrderPaymentTotals(order).toCollectCents
      : 0

  function isGiftCard(
    item: LineItem,
  ): item is Extract<LineItem, LineItem> & { item_type: "gift_cards" } {
    return (
      item.type === "line_items" &&
      item.item_type === "gift_cards" &&
      item.unit_amount_cents != null &&
      item.unit_amount_cents > 0
    )
  }

  const shoppableLineItems =
    order.line_items?.filter(
      (lineItem) =>
        arrayOf<LineItem["item_type"]>(["skus", "bundles"]).includes(
          lineItem.item_type,
        ) || isGiftCard(lineItem),
    ) ?? []

  const hasLineItems = shoppableLineItems.length > 0

  const shippableLineItems = shoppableLineItems.filter(
    (lineItem) => lineItem.sku?.do_not_ship !== true,
  )

  const hasShippableLineItems = shippableLineItems.length > 0

  const hasInvalidShipments =
    !hasLineItems ||
    (hasShippableLineItems &&
      ((order.shipments?.length ?? 0) <= 0 ||
        (order.shipments?.filter((shipment) => shipment.shipping_method == null)
          ?.length ?? 0) > 0))

  return {
    /** Order is in `editing` status and user has permission to update it. */
    isEditing,
    /** Whether the order has shoppable line items or not. */
    hasLineItems,
    /** `true` when there's one or not shipments without a selected `shipping_method`. */
    hasInvalidShipments,
    /** `true` when there's at least one shippable (do_not_ship = `false`) item. */
    hasShippableLineItems,
    /** `true` when the order has transactions, but the status is still `pending`. This is a kind of error status. */
    isPendingWithTransactions,
    /** Difference between the current `total_amount` and the `place_total_amount`. */
    diffTotalAndPlacedTotal:
      isOriginalOrderAmountExceeded && currencyCode != null
        ? formatCentsToCurrency(diffTotalAndPlacedTotal, currencyCode)
        : null,
    /** What the customer still has to pay before the edit can be finished. */
    amountToCollect:
      toCollectCents > 0 && currencyCode != null
        ? formatCentsToCurrency(toCollectCents, currencyCode)
        : null,
    /** `true` when the edit cannot be finished yet, whichever model applies. */
    isEditingBlocked: isOriginalOrderAmountExceeded || toCollectCents > 0,
  }
}
