import type { BadgeProps } from "@commercelayer/app-elements"
import {
  Badge,
  getOrderFulfillmentStatusName,
  getOrderPaymentStatusName,
  getOrderStatusName,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"

interface Props {
  order: Order
}

function getOrderStatusBadgeVariant(
  status: Order["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "approved":
      return "success"
    case "cancelled":
    case "draft":
    case "pending":
      return "secondary"
    case "placed":
    case "placing":
    case "editing":
      return "warning"
  }
}

function getPaymentStatusBadgeVariant(
  status: Order["payment_status"],
): BadgeProps["variant"] {
  switch (status) {
    case "paid":
    case "free":
      return "success"
    case "unpaid":
    case "partially_paid":
    case "refunded":
    case "voided":
    case "partially_refunded":
    case "partially_voided":
      return "secondary"
    case "authorized":
    case "partially_authorized":
      return "warning"
  }
}

function getFulfillmentStatusBadgeVariant(
  status: Order["fulfillment_status"],
): BadgeProps["variant"] {
  switch (status) {
    case "fulfilled":
      return "success"
    case "unfulfilled":
    case "not_required":
      return "secondary"
    case "in_progress":
      return "warning"
  }
}

export const OrderSteps = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element => {
    return (
      <>
        {order.status !== undefined && (
          <Badge
            variant={getOrderStatusBadgeVariant(order.status)}
            className="inline-block align-middle ml-2"
          >
            {getOrderStatusName(order.status)}
          </Badge>
        )}

        {order.payment_status !== undefined && (
          <Badge
            variant={getPaymentStatusBadgeVariant(order.payment_status)}
            className="inline-block align-middle ml-2"
          >
            {getOrderPaymentStatusName(order.payment_status)}
          </Badge>
        )}

        {order.fulfillment_status !== undefined && (
          <Badge
            variant={getFulfillmentStatusBadgeVariant(order.fulfillment_status)}
            className="inline-block align-middle ml-2"
          >
            {getOrderFulfillmentStatusName(order.fulfillment_status)}
          </Badge>
        )}
      </>
    )
  },
)
