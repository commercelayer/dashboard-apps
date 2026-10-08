import type { Order, PaymentCapture, PaymentSession } from "@commercelayer/sdk"
import { hasUnsettledTransaction } from "./sessionStatus"

/** Session statuses core accepts a capture from. */
export const CAPTURABLE_STATUSES: Array<PaymentSession["status"]> = [
  "authorized",
  "partially_paid",
  "partially_refunded",
]

/** Session statuses a refund can be issued from. */
const REFUNDABLE_STATUSES: Array<PaymentSession["status"]> = [
  "partially_paid",
  "paid",
  "partially_refunded",
]

/**
 * True when the session can be captured. Gated on the status too: after a
 * void, `capture_balance_cents` stays positive.
 */
export function canCapture(session: PaymentSession): boolean {
  return (
    !hasUnsettledTransaction(session) &&
    CAPTURABLE_STATUSES.includes(session.status) &&
    (session.payment_authorization?.capture_balance_cents ?? 0) > 0
  )
}

/** True when the session's authorization can be voided: only from `authorized`. */
export function canVoid(session: PaymentSession): boolean {
  return (
    !hasUnsettledTransaction(session) &&
    session.status === "authorized" &&
    session.payment_authorization != null
  )
}

/** The session's captures that can still be refunded, oldest first. */
export function getRefundableCaptures(
  session: PaymentSession,
): PaymentCapture[] {
  if (
    hasUnsettledTransaction(session) ||
    !REFUNDABLE_STATUSES.includes(session.status)
  ) {
    return []
  }

  return (session.payment_captures ?? [])
    .filter(
      (capture) =>
        capture.status === "succeeded" &&
        (capture.refund_balance_cents ?? 0) > 0,
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

/** A capture and the session it belongs to, which a refund needs both of. */
export interface RefundTarget {
  session: PaymentSession
  capture: PaymentCapture
}

/** Every refundable capture on the order, across sessions, oldest first. */
export function getOrderRefundableCaptures(order: Order): RefundTarget[] {
  return (order.payment_sessions ?? [])
    .flatMap((session) =>
      getRefundableCaptures(session).map((capture) => ({ session, capture })),
    )
    .sort((a, b) => a.capture.created_at.localeCompare(b.capture.created_at))
}
