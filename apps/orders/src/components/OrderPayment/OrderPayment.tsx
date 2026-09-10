import { withSkeletonTemplate } from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { OrderPaymentLegacy } from "#components/OrderPayment/OrderPaymentLegacy"
import { OrderPaymentSessions } from "#components/OrderPayment/OrderPaymentSessions"

interface Props {
  order: Order
  onOrderChange: () => void
}

/**
 * Renders both payment displays side by side. Each one independently
 * decides whether it has anything to show for this order (legacy orders
 * have a `payment_method`, new orders have `payment_sessions`), so only one
 * ever actually renders. Legacy is expected to be dropped once orders on
 * the 2017-08 payment model are no longer in use, delete
 * OrderPaymentLegacy.tsx, hasPaymentMethod in #utils/order, and the line
 * below that renders it.
 */
export const OrderPayment = withSkeletonTemplate<Props>(
  ({ order, onOrderChange }) => {
    return (
      <>
        <OrderPaymentLegacy order={order} />
        <OrderPaymentSessions order={order} onOrderChange={onOrderChange} />
      </>
    )
  },
)
