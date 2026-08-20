import type { BadgeProps } from "@commercelayer/app-elements"
import type { PaymentSession } from "@commercelayer/sdk"

export function getPaymentSessionBadgeVariant(
  status: PaymentSession["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "paid":
      return "success"
    case "authorized":
    case "partially_paid":
    case "partially_refunded":
      return "warning"
    case "voided":
      return "danger"
    default:
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
      return "partially refunded"
  }
}

export function canCaptureOrVoid(session: PaymentSession): boolean {
  return (
    session.status === "authorized" && session.payment_authorization != null
  )
}
