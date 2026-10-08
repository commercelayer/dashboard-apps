import type { Order, PaymentSession } from "@commercelayer/sdk"
import { CAPTURABLE_STATUSES, canCapture, canVoid } from "./sessionActions"
import { sumSucceededCents } from "./sessionAmounts"
import { hasPollableTransaction } from "./sessionStatus"

/**
 * True when the order uses payment sessions. A non-empty `payment_sessions` is
 * the only signal the order carries.
 */
export function isNewPaymentModel(order: Order): boolean {
  return (order.payment_sessions ?? []).length > 0
}

/**
 * True when the order has a legacy payment. Not simply "not new": an order
 * with no payment at all (a free one, say) is neither.
 */
export function isLegacyPaymentModel(order: Order): boolean {
  return (
    !isNewPaymentModel(order) &&
    (order.payment_method != null ||
      order.payment_source != null ||
      (order.transactions ?? []).length > 0)
  )
}

/** The order's sessions that can be captured. */
export function getCapturableSessions(order: Order): PaymentSession[] {
  return (order.payment_sessions ?? []).filter(canCapture)
}

/** The order's sessions whose authorization can be voided. */
export function getVoidableSessions(order: Order): PaymentSession[] {
  return (order.payment_sessions ?? []).filter(canVoid)
}

/** True while a session on the order waits on the gateway. */
export function hasOrderPaymentInFlight(order: Order): boolean {
  return (order.payment_sessions ?? []).some(hasPollableTransaction)
}

function getCaptureBalanceCents(session: PaymentSession): number {
  return session.payment_authorization?.capture_balance_cents ?? 0
}

function getCapturedCents(order: Order): number {
  return (order.payment_sessions ?? []).reduce(
    (total, session) => total + sumSucceededCents(session.payment_captures),
    0,
  )
}

/**
 * How much an order-level capture should take: what the order still needs,
 * capped at what its authorizations can give. Core does not cap it, so an
 * order edited down would otherwise be over-captured.
 */
export function getCapturableAmountCents(order: Order): number {
  const outstanding =
    (order.total_amount_with_taxes_cents ?? 0) - getCapturedCents(order)
  const capturable = getCapturableSessions(order).reduce(
    (total, session) => total + getCaptureBalanceCents(session),
    0,
  )

  return Math.max(0, Math.min(outstanding, capturable))
}

/**
 * The default split of `getCapturableAmountCents` across sessions, oldest
 * first. Sessions that get nothing are left out.
 */
export function getCaptureDistribution(
  order: Order,
): Array<{ session: PaymentSession; amountCents: number }> {
  let remaining = getCapturableAmountCents(order)

  return getCapturableSessions(order)
    .map((session) => {
      const amountCents = Math.min(getCaptureBalanceCents(session), remaining)
      remaining -= amountCents
      return { session, amountCents }
    })
    .filter(({ amountCents }) => amountCents > 0)
}

/**
 * The order's payment figures, in cents, computed from its transactions
 * rather than its session amounts, which do not follow order edits.
 */
export function getOrderPaymentTotals(order: Order): {
  /** Captured, before refunds. */
  capturedCents: number
  refundedCents: number
  /** Captured minus refunded. */
  paidCents: number
  /** Authorized and not yet captured. */
  heldCents: number
  /** Still missing once the useful part of the holds is captured. */
  toCollectCents: number
  /** Paid beyond the order total. */
  toRefundCents: number
} {
  const sessions = order.payment_sessions ?? []

  const capturedCents = getCapturedCents(order)
  const refundedCents = sessions.reduce(
    (total, session) => total + sumSucceededCents(session.payment_refunds),
    0,
  )
  /** A voided session keeps its capture balance, hence the status filter. */
  const heldCents = sessions
    .filter((session) => CAPTURABLE_STATUSES.includes(session.status))
    .reduce((total, session) => total + getCaptureBalanceCents(session), 0)

  const paidCents = capturedCents - refundedCents
  const missingCents = (order.total_amount_with_taxes_cents ?? 0) - paidCents
  /** A hold only covers what the order still needs; the rest is a leftover. */
  const coveredCents = Math.max(0, Math.min(heldCents, missingCents))

  return {
    capturedCents,
    refundedCents,
    paidCents,
    heldCents,
    toCollectCents: Math.max(0, missingCents - coveredCents),
    toRefundCents: Math.max(0, -missingCents),
  }
}
