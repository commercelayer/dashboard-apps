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
 * that against the total printed right above. The opposite case, more paid
 * than the order is worth, is a warning box instead (see `useSummaryRows`):
 * it needs an action, not a figure. Showing the gross captured amount is
 * what makes the rest reconcilable, since a net "paid" next to a gross
 * "refunded" reads as a contradiction whenever the two have crossed.
 *
 * Every row is hidden at zero, so a plain fully paid order shows one line. The
 * figures come from the transactions, not the session amounts, so they stay
 * true after an order is edited.
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

  const { capturedCents, refundedCents, paidCents, heldCents, toCollectCents } =
    getOrderPaymentTotals(order)

  const format = (cents: number): string =>
    formatCentsToCurrency(cents, currencyCode)

  // While editing, the total above is still moving, so anything measured
  // against it would be a claim about an order that does not exist yet. What
  // was actually captured and refunded is a fact either way.
  const isEditing = order.status === "editing"

  // What is held beyond what the order still needs. Only this part expires:
  // the rest is waiting to be captured, which is a different story.
  const excessHoldCents =
    heldCents -
    Math.max(0, (order.total_amount_with_taxes_cents ?? 0) - paidCents)

  const rows = [
    { key: "captured", label: "Captured", value: format(capturedCents) },
    {
      key: "refunded",
      label: "Refunded",
      value: `-${format(refundedCents)}`,
      hidden: refundedCents === 0,
    },
    {
      key: "paid",
      label: "Paid",
      value: format(paidCents),
      bold: true,
      // Only worth its own line once it differs from the captured amount.
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
        !isEditing && excessHoldCents > 0
          ? `${
              excessHoldCents === heldCents
                ? "This amount is"
                : `${format(excessHoldCents)} of this is`
            } no longer needed to cover the order. It cannot be released, so it stays authorized until the gateway lets it expire.`
          : undefined,
    },
    {
      key: "toCollect",
      label: "To collect",
      value: format(toCollectCents),
      hidden: isEditing || toCollectCents === 0,
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
        {rows.map(({ key, label, value, bold, hint }) => (
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
              bold,
            })}
          </div>
        ))}
      </>
    </>
  )
}
