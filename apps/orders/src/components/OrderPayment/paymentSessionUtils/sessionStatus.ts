import type { BadgeProps } from "@commercelayer/app-elements"
import type { PaymentSession, PaymentTransaction } from "@commercelayer/sdk"

/**
 * How long an unsettled transaction is treated as in flight. Past it, it is
 * considered stuck: core does not settle a transaction whose gateway call
 * failed.
 */
const IN_FLIGHT_WINDOW_MS = 10 * 60 * 1_000

/** Transaction statuses the gateway has not settled yet. */
const UNSETTLED_STATUSES: Array<PaymentTransaction["status"]> = [
  "pending",
  "requires_action",
  "processing",
]

type TransactionLike = Pick<PaymentTransaction, "status" | "created_at">

/**
 * True when the transaction is unsettled and recent. With
 * `excludeCustomerAction`, `requires_action` does not count, since it waits
 * on the customer rather than the gateway.
 */
function isInFlight(
  transaction: TransactionLike,
  { excludeCustomerAction = false }: { excludeCustomerAction?: boolean } = {},
): boolean {
  const isUnsettled = excludeCustomerAction
    ? transaction.status === "pending" || transaction.status === "processing"
    : UNSETTLED_STATUSES.includes(transaction.status)

  return (
    isUnsettled &&
    new Date(transaction.created_at).getTime() >
      Date.now() - IN_FLIGHT_WINDOW_MS
  )
}

function hasInFlight(
  transactions: TransactionLike[] | null | undefined,
): boolean {
  return (transactions ?? []).some((transaction) => isInFlight(transaction))
}

/** True while a transaction on the session is in flight. Blocks new actions. */
export function hasUnsettledTransaction(session: PaymentSession): boolean {
  return hasInFlight(session.payment_transactions)
}

/** True while the session waits on the gateway, so the page should poll. */
export function hasPollableTransaction(session: PaymentSession): boolean {
  return (session.payment_transactions ?? []).some((transaction) =>
    isInFlight(transaction, { excludeCustomerAction: true }),
  )
}

/**
 * What the session is doing right now, if anything. Its status only changes
 * once the transaction settles, so this reads the in-flight transaction.
 */
export function getPaymentSessionActivity(
  session: PaymentSession,
): "capturing" | "voiding" | "refunding" | undefined {
  if (hasInFlight(session.payment_captures)) {
    return "capturing"
  }
  if (session.payment_void != null && hasInFlight([session.payment_void])) {
    return "voiding"
  }
  if (hasInFlight(session.payment_refunds)) {
    return "refunding"
  }
}

/** Badge colour for the session, warning while an action is in flight. */
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
      // Includes `voided`: a normal outcome, not a failure.
      return "secondary"
  }
}

/** Status shown on the session badge, or the action in flight. */
export function getPaymentSessionStatusName(session: PaymentSession): string {
  return getPaymentSessionActivity(session) ?? getStatusName(session.status)
}

/** No `default`, so a new status fails type-checking instead of leaking. */
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
      // Shortened so the row's amount stays aligned.
      return "part. refunded"
  }
}
