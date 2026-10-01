import {
  type CurrencyCode,
  formatCentsToCurrency,
} from "@commercelayer/app-elements"
import type { PaymentSession, PaymentTransaction } from "@commercelayer/sdk"
import type { PaymentDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"

/** Sum of the succeeded transactions' amounts, in cents. */
export function sumSucceededCents(
  transactions:
    | Array<Pick<PaymentTransaction, "status" | "amount_cents">>
    | null
    | undefined,
): number {
  return (transactions ?? [])
    .filter((transaction) => transaction.status === "succeeded")
    .reduce((total, transaction) => total + (transaction.amount_cents ?? 0), 0)
}

function format(cents: number, session: PaymentSession): string | undefined {
  const currencyCode = session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined
  return currencyCode == null
    ? undefined
    : formatCentsToCurrency(cents, currencyCode)
}

/**
 * Amount refunded on the session, formatted, or `undefined` when none. Summed
 * here because core's `refund_balance_cents` also counts failed refunds.
 */
export function getRefundedAmount(session: PaymentSession): string | undefined {
  const refundedCents = sumSucceededCents(session.payment_refunds)
  return refundedCents > 0 ? format(refundedCents, session) : undefined
}

/**
 * Amount captured on the session, formatted, but only when it differs from
 * the session amount: a full capture needs no extra line.
 */
export function getCapturedAmount(session: PaymentSession): string | undefined {
  const capturedCents = sumSucceededCents(session.payment_captures)
  return capturedCents > 0 && capturedCents !== session.amount_cents
    ? format(capturedCents, session)
    : undefined
}

/** "Mastercard ··4242", or the label alone when there is no last 4. */
export function getInstrumentLabel({ label, last4 }: PaymentDisplay): string {
  return last4 != null ? `${label} ··${last4}` : label
}
