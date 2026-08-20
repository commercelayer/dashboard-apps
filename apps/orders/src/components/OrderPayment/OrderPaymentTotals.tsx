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

/**
 * What happened to the money, under the order total.
 *
 * Read as a ledger rather than as independent figures: captured, minus
 * refunded, is what the order holds, and the "To collect" row below compares
 * that net against the total printed right above. The opposite case, more paid
 * than the order is worth, is a warning box instead (see `useSummaryRows`):
 * it needs an action, not a figure. Showing the gross captured amount is
 * what makes the rest reconcilable, since a net "paid" next to a gross
 * "refunded" reads as a contradiction whenever the two have crossed.
 *
 * Every row is hidden at zero, so a plain fully paid order shows one line. The
 * figures come from the transactions, not the session amounts, so they stay
 * true after an order is edited, and the block reads the same whether or not
 * the order is being edited: while editing the total above is still moving,
 * which is a reason for these figures to move with it rather than to vanish.
 */
export function OrderPaymentTotals({
  order,
}: {
  order: Order
}): React.JSX.Element | null {
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

  // What is held beyond what the order still needs. Only this part expires:
  // the rest is waiting to be captured, which is a different story.
  const excessHoldCents =
    heldCents -
    Math.max(0, (order.total_amount_with_taxes_cents ?? 0) - paidCents)

  const rows = [
    {
      key: "captured",
      label: "Captured",
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
      // A hold the order no longer needs cannot be voided once its session has
      // been partially captured, so it sits there until the gateway drops it.
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
      // Unlike every other figure here this one is not a state of the order,
      // it is money owed back, and nothing resolves it until someone refunds
      // it. Hence the explanation rather than a bare number.
      hint: `${format(toRefundCents)} has been paid above the ${
        order.formatted_total_amount_with_taxes
      } total. Refund the difference.`,
    },
    {
      key: "toCollect",
      label: "To collect",
      value: format(toCollectCents),
      hidden: toCollectCents === 0,
      // The counterpart of "To refund": what someone still has to do about it.
      // Deliberately does not name the checkout link, which only a `pending`
      // order offers: collecting more on an order already placed is to be done
      // with a payment link.
      hint: `${format(
        toCollectCents,
      )} of the total is not covered by any payment yet. Collect the difference or adjust the total.`,
    },
  ].filter(({ hidden }) => hidden !== true)

  if (capturedCents === 0 && heldCents === 0 && toCollectCents === 0) {
    return null
  }

  return (
    <>
      <Spacer top="4" bottom="4">
        <Hr variant="dashed" />
      </Spacer>
      <>
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
    </>
  )
}
