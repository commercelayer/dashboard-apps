import {
  type CurrencyCode,
  formatCentsToCurrency,
  Hr,
  Icon,
  Spacer,
  Tooltip,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import {
  getOrderPaymentTotals,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import { renderTotalRow } from "#components/OrderSummary/utils"

interface Props {
  order: Order
}

/** The order's payment figures under its total; rows at zero are hidden. */
export function OrderPaymentTotals({ order }: Props): React.JSX.Element | null {
  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  if (!isNewPaymentModel(order) || currencyCode == null) {
    return null
  }

  const {
    capturedCents,
    refundedCents,
    paidCents,
    heldCents,
    toCollectCents,
    toRefundCents,
  } = getOrderPaymentTotals(order)

  const format = (cents: number): string =>
    formatCentsToCurrency(cents, currencyCode)

  /** Held beyond what the order still needs: the only part that expires unused. */
  const excessHoldCents =
    heldCents -
    Math.max(0, (order.total_amount_with_taxes_cents ?? 0) - paidCents)

  const rows = [
    {
      key: "captured",
      label: "Paid",
      value: format(capturedCents),
      hidden: capturedCents === 0,
    },
    {
      key: "refunded",
      label: "Refunded",
      value: `-${format(refundedCents)}`,
      hidden: refundedCents === 0,
    },
    {
      key: "held",
      label: "Authorized",
      value: format(heldCents),
      hidden: heldCents === 0,
      hint:
        excessHoldCents > 0
          ? `${
              excessHoldCents === heldCents
                ? "This amount is"
                : `${format(excessHoldCents)} of this is`
            } no longer needed to cover the order. It cannot be released, so it stays authorized until the gateway lets it expire.`
          : undefined,
    },
    {
      key: "toRefund",
      label: "To refund",
      value: format(toRefundCents),
      hidden: toRefundCents === 0,
      hint: `${format(toRefundCents)} has been paid above the ${
        order.formatted_total_amount_with_taxes
      } total. Refund the difference.`,
    },
    {
      key: "toCollect",
      label: "To collect",
      value: format(toCollectCents),
      hidden: toCollectCents === 0,
      hint: `${format(
        toCollectCents,
      )} of the total is not covered by any payment yet. Collect the difference or adjust the total.`,
    },
  ].filter(({ hidden }) => hidden !== true)

  if (rows.length === 0) {
    return null
  }

  return (
    <>
      <Spacer top="4" bottom="4">
        <Hr variant="dashed" />
      </Spacer>
      {rows.map(({ key, label, value, hint }) => (
        <div key={key}>
          {renderTotalRow({
            label:
              hint == null ? (
                label
              ) : (
                <div className="flex items-center gap-1">
                  {label}
                  <Tooltip label={<Icon name="info" />} content={hint} />
                </div>
              ),
            value,
          })}
        </div>
      ))}
    </>
  )
}
