import {
  type BadgeProps,
  type CurrencyCode,
  formatCentsToCurrency,
} from "@commercelayer/app-elements"
import type {
  Order,
  PaymentCapture,
  PaymentSession,
  PaymentTransaction,
} from "@commercelayer/sdk"
import type { PaymentDisplay } from "#components/OrderPayment/paymentDisplay"

/**
 * Both this and `getPaymentSessionStatusName` take the whole session, not just
 * its status, so a write in flight is resolved here rather than at every call
 * site (see `getPaymentSessionActivity`).
 */
export function getPaymentSessionBadgeVariant(
  session: PaymentSession,
): BadgeProps["variant"] {
  if (getPaymentSessionActivity(session) != null) {
    return "warning"
  }

  switch (session.status) {
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
export function getPaymentSessionStatusName(session: PaymentSession): string {
  return getPaymentSessionActivity(session) ?? getStatusName(session.status)
}

/**
 * Split out from `getPaymentSessionStatusName` to keep the switch exhaustive
 * over the status union alone.
 */
function getStatusName(status: PaymentSession["status"]): string {
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
    case "invalidated":
      return "invalidated"
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
 * What the session is currently doing, when it is doing something.
 *
 * The session status itself does not move while a write is in flight: a
 * capture on an `authorized` session leaves it `authorized` until the worker
 * succeeds. The pending transaction is the only signal, and the typed
 * relationships are what tell the kinds apart, since entries in
 * `payment_transactions` all come back as the generic
 * `type: "payment_transactions"`.
 *
 * Bounded by the same window as the polling: past it the transaction is
 * treated as stuck, so a swallowed gateway error cannot leave a row saying
 * "capturing" forever.
 */
export function getPaymentSessionActivity(
  session: PaymentSession,
): "capturing" | "voiding" | "refunding" | undefined {
  if (isInFlight(session.payment_captures)) {
    return "capturing"
  }
  if (isInFlight(session.payment_void == null ? [] : [session.payment_void])) {
    return "voiding"
  }
  if (isInFlight(session.payment_refunds)) {
    return "refunding"
  }
}

function isInFlight(
  transactions:
    | Array<{ status: PaymentTransaction["status"]; created_at: string }>
    | null
    | undefined,
): boolean {
  const oldest = Date.now() - POLLING_WINDOW_MS

  return (transactions ?? []).some(
    (transaction) =>
      UNSETTLED_TRANSACTION_STATUSES.includes(transaction.status) &&
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

  return (
    (session.payment_captures ?? [])
      .filter(
        (capture) =>
          capture.status === "succeeded" &&
          (capture.refund_balance_cents ?? 0) > 0,
      )
      // Oldest first, so the list and the preselection do not depend on
      // whatever order the API returned.
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  )
}

/** A capture, with the session it belongs to: a refund needs both. */
export interface RefundTarget {
  session: PaymentSession
  capture: PaymentCapture
}

/**
 * Every refundable capture on the order, across all its sessions.
 *
 * Used by the order-level Refund action, where the choice spans instruments.
 * The per-row action passes only its own session's captures.
 */
export function getOrderRefundableCaptures(order: Order): RefundTarget[] {
  return (order.payment_sessions ?? [])
    .flatMap((session) =>
      getRefundableCaptures(session).map((capture) => ({ session, capture })),
    )
    .sort((a, b) => a.capture.created_at.localeCompare(b.capture.created_at))
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

/**
 * Total successfully captured, formatted, but only when it differs from the
 * amount the session set out to collect.
 *
 * A full capture needs no line: the session amount already says it. A partial
 * one does, because the row would otherwise show $40.00 when $25.00 was taken.
 * Nothing captured yet is not a divergence either, it is what `authorized`
 * means, so it stays silent.
 */
export function getCapturedAmount(session: PaymentSession): string | undefined {
  const currencyCode = session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined
  if (currencyCode == null) {
    return undefined
  }

  const capturedCents = (session.payment_captures ?? [])
    .filter((capture) => capture.status === "succeeded")
    .reduce((total, capture) => total + (capture.amount_cents ?? 0), 0)

  return capturedCents > 0 && capturedCents !== session.amount_cents
    ? formatCentsToCurrency(capturedCents, currencyCode)
    : undefined
}

/** "Mastercard ··4242", or just the label when there is no tail to show. */
export function getInstrumentLabel({ label, last4 }: PaymentDisplay): string {
  return last4 != null ? `${label} ··${last4}` : label
}

/**
 * Whether the order is on the 2026-05 payment model.
 *
 * There is no version flag on the order, and `payment_sessions` is always
 * present as an array, so a non-empty one is the only available signal. It is
 * enough for the order-level actions, which only exist once a payment has been
 * attempted: a legacy order never has sessions, and a new-model order with no
 * session has nothing to capture, void or refund either way.
 */
export function isNewPaymentModel(order: Order): boolean {
  return (order.payment_sessions ?? []).length > 0
}

/** Sessions the order-level "Capture payment" button should act on. */
export function getCapturableSessions(order: Order): PaymentSession[] {
  return (order.payment_sessions ?? []).filter(canCapture)
}

/** Sessions whose authorization can still be voided. */
export function getVoidableSessions(order: Order): PaymentSession[] {
  return (order.payment_sessions ?? []).filter(canVoid)
}

/** Total still capturable across the order, before any capping, in cents. */
function getCapturableBalanceCents(order: Order): number {
  return getCapturableSessions(order).reduce(
    (total, session) =>
      total + (session.payment_authorization?.capture_balance_cents ?? 0),
    0,
  )
}

/** Everything already taken on this order, in cents. */
function getCapturedAmountCents(order: Order): number {
  return (order.payment_sessions ?? []).reduce(
    (total, session) =>
      total +
      (session.payment_captures ?? [])
        .filter((capture) => capture.status === "succeeded")
        .reduce((sum, capture) => sum + (capture.amount_cents ?? 0), 0),
    0,
  )
}

/**
 * What the order-level capture should take in total.
 *
 * The order total, minus what is already captured, capped at what the
 * authorizations can still give. The cap matters after an order is edited
 * down: sessions keep their original amounts, so capturing every balance in
 * full would take more than the order is now worth. Legacy clamped this in
 * core; the 2026-05 model deliberately leaves it to the caller, since a
 * payment session need not belong to an order at all.
 *
 * The second half of the `min` is defensive only: the dashboard does not offer
 * Approve until an order is fully authorized, so in its own flow the
 * outstanding amount is always reachable.
 */
export function getCapturableAmountCents(order: Order): number {
  const outstanding =
    (order.total_amount_with_taxes_cents ?? 0) - getCapturedAmountCents(order)

  return Math.max(0, Math.min(outstanding, getCapturableBalanceCents(order)))
}

/**
 * How much to take from each session, oldest first, so the total matches
 * `getCapturableAmountCents`. A session capped below its own balance leaves
 * the remainder authorized: it cannot be voided (a partial capture moves the
 * session to `partially_paid`, and voiding is only legal from `authorized`),
 * so it expires at the gateway.
 */
export function getCaptureDistribution(
  order: Order,
): Array<{ session: PaymentSession; amountCents: number }> {
  let remaining = getCapturableAmountCents(order)

  return getCapturableSessions(order)
    .map((session) => {
      const balance = session.payment_authorization?.capture_balance_cents ?? 0
      const amountCents = Math.min(balance, remaining)
      remaining -= amountCents
      return { session, amountCents }
    })
    .filter(({ amountCents }) => amountCents > 0)
}

/**
 * What the order has actually collected, committed, and still needs.
 *
 * Derived from the transactions rather than from the session amounts, because
 * a session keeps the amount it was created with: after an order is edited,
 * that figure no longer describes what moved. All values are in cents.
 */
export function getOrderPaymentTotals(order: Order): {
  /** Everything the gateways took, before any refund. */
  capturedCents: number
  refundedCents: number
  /** Captured minus refunded: what we hold. */
  paidCents: number
  /** Authorized and not captured, whether or not the order still needs it. */
  heldCents: number
  /** Still to be collected once the authorizations above are captured. */
  toCollectCents: number
  /** Held beyond what the order is worth, which only a refund can correct. */
  toRefundCents: number
} {
  const sessions = order.payment_sessions ?? []

  const capturedCents = getCapturedAmountCents(order)
  const refundedCents = sessions.reduce(
    (total, session) =>
      total +
      (session.payment_refunds ?? [])
        .filter((refund) => refund.status === "succeeded")
        .reduce((sum, refund) => sum + (refund.amount_cents ?? 0), 0),
    0,
  )

  // Only sessions still holding money: a voided one keeps a positive capture
  // balance, since a void does not touch it.
  const heldCents = sessions
    .filter(
      (session) =>
        session.status === "authorized" || session.status === "partially_paid",
    )
    .reduce(
      (total, session) =>
        total + (session.payment_authorization?.capture_balance_cents ?? 0),
      0,
    )

  const paidCents = capturedCents - refundedCents
  const missingCents = (order.total_amount_with_taxes_cents ?? 0) - paidCents

  // A hold only counts as coverage up to what the order still needs. Beyond
  // that it is a leftover, not money on its way in, which is what made a fully
  // captured order look as though it owed a refund.
  const authorizedCents = Math.max(0, Math.min(heldCents, missingCents))

  return {
    capturedCents,
    refundedCents,
    paidCents,
    heldCents,
    toCollectCents: Math.max(0, missingCents - authorizedCents),
    toRefundCents: Math.max(0, -missingCents),
  }
}

/** True while any session on the order has a write in flight. */
export function hasOrderPaymentInFlight(order: Order): boolean {
  return (order.payment_sessions ?? []).some(hasPollableTransaction)
}
