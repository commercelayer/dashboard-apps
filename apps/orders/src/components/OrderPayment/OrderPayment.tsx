import { withSkeletonTemplate } from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { OrderPaymentLegacy } from "#components/OrderPayment/OrderPaymentLegacy"
import { OrderPaymentSessions } from "#components/OrderPayment/OrderPaymentSessions"
import { isLegacyPaymentModel } from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  order: Order
  onOrderChange: () => void
}

/** The order's payments: the legacy payment method, or the payment sessions. */
export const OrderPayment = withSkeletonTemplate<Props>(
  ({ order, onOrderChange }) => {
    return isLegacyPaymentModel(order) ? (
      <OrderPaymentLegacy order={order} />
    ) : (
      <OrderPaymentSessions order={order} onOrderChange={onOrderChange} />
    )
  },
)
