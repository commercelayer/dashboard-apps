import {
  Alert,
  Button,
  type CurrencyCode,
  formatCentsToCurrency,
  type ResourceLineItemsProps,
  Spacer,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { OrderPaymentTotals } from "#components/OrderPayment/OrderPaymentTotals"
import {
  getOrderPaymentTotals,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { DeleteCouponButton } from "../DeleteCouponButton"
import { SummaryRows } from "../SummaryRows"
import { renderTotalRow } from "../utils"
import { useAddCouponOverlay } from "./useAddCouponOverlay"
import { useOrderStatus } from "./useOrderStatus"

export function useSummaryRows(order: Order): {
  summaryRows: ResourceLineItemsProps["footer"]
} {
  const { mutateOrder } = useOrderDetails(order.id)
  const { isEditing, diffTotalAndPlacedTotal } = useOrderStatus(order)
  const { t } = useTranslation()

  const { Overlay: AddCouponOverlay, open: openAddCouponOverlay } =
    useAddCouponOverlay(order, () => {
      void mutateOrder()
    })

  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  /**
   * More collected than the order is worth, which is where an order edited
   * down after capture ends up. A warning rather than a row in the totals:
   * unlike the other figures it is not a state of the order, it is money owed
   * back to the customer, and nothing resolves it until someone refunds it.
   */
  const toRefundCents = isNewPaymentModel(order)
    ? getOrderPaymentTotals(order).toRefundCents
    : 0

  const summaryRows: ResourceLineItemsProps["footer"] = []

  if (isEditing || order.coupon_code != null) {
    summaryRows.push({
      key: "coupon",
      element: (
        <>
          <AddCouponOverlay />
          {renderTotalRow({
            label: t("resources.coupons.name"),
            value:
              order.coupon_code == null ? (
                <Button
                  variant="link"
                  onClick={() => {
                    openAddCouponOverlay()
                  }}
                >
                  {t("common.add_resource", {
                    resource: t("resources.coupons.name").toLowerCase(),
                  })}
                </Button>
              ) : (
                <div className="flex gap-3">
                  {order.coupon_code}
                  {isEditing && (
                    <DeleteCouponButton
                      order={order}
                      onChange={() => {
                        void mutateOrder()
                      }}
                    />
                  )}
                </div>
              ),
          })}
        </>
      ),
    })
  }

  summaryRows.push({
    key: "summary",
    element: (
      <>
        <SummaryRows order={order} editable={isEditing} />
        <OrderPaymentTotals order={order} />
        {toRefundCents > 0 && currencyCode != null && (
          <Spacer bottom="8">
            <Alert status="warning">
              {formatCentsToCurrency(toRefundCents, currencyCode)} has been paid
              above the {order.formatted_total_amount_with_taxes} total.
              <br />
              {order.status === "editing"
                ? "Refund the difference once you finish editing."
                : "Refund the difference to the customer."}
            </Alert>
          </Spacer>
        )}
        {diffTotalAndPlacedTotal != null && (
          <Spacer bottom="8">
            <Alert status="warning">
              {t("apps.orders.details.new_total_line1", {
                new_total: order.formatted_total_amount_with_taxes,
                difference: diffTotalAndPlacedTotal,
              })}
              <br />
              {t("apps.orders.details.new_total_line2")}
            </Alert>
          </Spacer>
        )}
      </>
    ),
  })

  return {
    summaryRows,
  }
}
