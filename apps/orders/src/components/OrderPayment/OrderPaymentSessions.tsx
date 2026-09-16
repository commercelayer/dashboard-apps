import { withSkeletonTemplate } from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { ResourcePaymentSessions } from "#components/OrderPayment/ResourcePaymentSessions"

interface Props {
  order: Order
  onOrderChange: () => void
}

/**
 * Payments display for orders placed under API version 2026-05+.
 * Thin adapter: pulls the sessions off the order and hands them to
 * `ResourcePaymentSessions`, which doesn't need to know about `Order` at all.
 */
export const OrderPaymentSessions = withSkeletonTemplate<Props>(
  ({ order, onOrderChange }) => {
    return (
      <ResourcePaymentSessions
        sessions={order.payment_sessions ?? []}
        onChange={onOrderChange}
      />
    )
  },
)
