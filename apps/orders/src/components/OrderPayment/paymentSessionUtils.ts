import {
  type BadgeProps,
  type CurrencyCode,
  formatCentsToCurrency,
} from "@commercelayer/app-elements"
import type { PaymentCapture, PaymentSession } from "@commercelayer/sdk"
import type { PaymentDisplay } from "#components/OrderPayment/paymentDisplay"

export function getPaymentSessionBadgeVariant(
  status: PaymentSession["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "paid":
      return "success"
    case "authorized":
    case "partially_paid":
      return "warning"
    default:
      // `voided` included: a void is a normal outcome, not a failure, so it
      // reads gray rather than red (design call, 2026-08-21).
      return "secondary"
  }
}

/**
 * Human-readable name for a payment session status, mirroring the
 * `get*StatusName` helpers app-elements exposes for the order statuses.
 * Exhaustive on purpose: no `default`, so a new status added to the SDK
 * union surfaces as a type error instead of leaking `snake_case` to the UI.
 */
export function getPaymentSessionStatusName(
  status: PaymentSession["status"],
): string {
  switch (status) {
    case "unpaid":
      return "unpaid"
    case "authorized":
      return "authorized"
    case "voided":
      return "voided"
    case "paid":
      return "paid"
    case "partially_paid":
      return "partially paid"
    case "refunded":
      return "refunded"
    case "partially_refunded":
      // Abbreviated on purpose: the full wording pushed the row's amount out
      // of alignment (design call, 2026-08-21).
      return "part. refunded"
  }
}

/**
 * Transaction statuses the gateway has not settled yet.
 *
 * A transaction is created as `pending` and handed to a background worker
 * that talks to the gateway, so every payment action is asynchronous: the
 * session status only moves once the worker lands on one of the terminal
 * statuses (`succeeded`, `declined`, `failed`, `canceled`, `expired`).
 */
const UNSETTLED_TRANSACTION_STATUSES: Array<PaymentCapture["status"]> = [
  "pending",
  "requires_action",
  "processing",
]

/**
 * True while any of the session's transactions is still in flight.
 *
 * Drives both the polling in `useOrderDetails` and the action gating below:
 * the balances an action is gated on only count succeeded transactions, so
 * without this an in-flight capture would leave `Capture` enabled and invite
 * a double charge.
 */
export function hasUnsettledTransaction(session: PaymentSession): boolean {
  return (session.payment_transactions ?? []).some((transaction) =>
    UNSETTLED_TRANSACTION_STATUSES.includes(transaction.status),
  )
}

/**
 * How long a transaction is worth polling for. Beyond this it is treated as
 * stuck rather than in flight: a gateway call that raises is swallowed by
 * core-api (`rescue_and_log` returns before the status is advanced) and
 * Sidekiq does not retry, so such a transaction stays non-terminal forever
 * and would otherwise keep the detail page polling for as long as it is open.
 */
const POLLING_WINDOW_MS = 10 * 60 * 1000

/**
 * True while something is actually worth waiting for, which is narrower than
 * `hasUnsettledTransaction`: `requires_action` is excluded because it waits on
 * the customer (3DS and similar) rather than the gateway, and anything older
 * than the window above is treated as stuck.
 */
export function hasPollableTransaction(session: PaymentSession): boolean {
  const oldest = Date.now() - POLLING_WINDOW_MS

  return (session.payment_transactions ?? []).some(
    (transaction) =>
      (transaction.status === "pending" ||
        transaction.status === "processing") &&
      new Date(transaction.created_at).getTime() > oldest,
  )
}

/**
 * Statuses the session's AASM `pay` event can transition from. Mirroring them
 * is what keeps a voided session out: `capture_balance_cents` only counts
 * succeeded captures, so it stays positive after a void and is not a gate on
 * its own. core-api currently has no guard either, so a capture after a void
 * reaches the gateway and lands the session in an inconsistent state.
 */
const CAPTURABLE_STATUSES: Array<PaymentSession["status"]> = [
  "authorized",
  "partially_paid",
]

/**
 * Also allowed on `partially_paid`, not just `authorized`: a partial capture
 * moves the session there, and the API still accepts a capture for the rest.
 */
export function canCapture(session: PaymentSession): boolean {
  return (
    !hasUnsettledTransaction(session) &&
    CAPTURABLE_STATUSES.includes(session.status) &&
    (session.payment_authorization?.capture_balance_cents ?? 0) > 0
  )
}

/**
 * Voiding is only legal from `authorized`, so the session status is the gate
 * here. `void_balance_cents` is not usable on its own: it ignores captures
 * and stays positive on a session that has already been partially captured.
 */
export function canVoid(session: PaymentSession): boolean {
  return (
    !hasUnsettledTransaction(session) &&
    session.status === "authorized" &&
    session.payment_authorization != null
  )
}

/**
 * Captures that reached the gateway and still have something left to refund.
 *
 * A refund references a capture, not a session, and its amount is validated
 * against that capture, so this list is what a refund can be issued against.
 */
/** Statuses the session's AASM `refund` event can transition from. */
const REFUNDABLE_STATUSES: Array<PaymentSession["status"]> = [
  "partially_paid",
  "paid",
  "partially_refunded",
]

export function getRefundableCaptures(
  session: PaymentSession,
): PaymentCapture[] {
  if (
    hasUnsettledTransaction(session) ||
    !REFUNDABLE_STATUSES.includes(session.status)
  ) {
    return []
  }

  return (session.payment_captures ?? []).filter(
    (capture) =>
      capture.status === "succeeded" && (capture.refund_balance_cents ?? 0) > 0,
  )
}

/**
 * Total successfully refunded on a session, formatted, or `undefined` when
 * nothing has been refunded.
 *
 * Summed client-side because the session exposes only the amount it was
 * created to collect: `capture_balance_cents` and `refund_balance_cents` exist
 * on the model in core-api but are not exposed as API fields.
 */
export function getRefundedAmount(session: PaymentSession): string | undefined {
  const currencyCode = session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined
  if (currencyCode == null) {
    return undefined
  }

  const refundedCents = (session.payment_refunds ?? [])
    .filter((refund) => refund.status === "succeeded")
    .reduce((total, refund) => total + (refund.amount_cents ?? 0), 0)

  return refundedCents > 0
    ? formatCentsToCurrency(refundedCents, currencyCode)
    : undefined
}

/** "Mastercard ··4242", or just the label when there is no tail to show. */
export function getInstrumentLabel({ label, last4 }: PaymentDisplay): string {
  return last4 != null ? `${label} ··${last4}` : label
}
