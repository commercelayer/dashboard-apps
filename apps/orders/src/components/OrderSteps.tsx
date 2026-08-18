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
      // One flex item rather than three, so the group sits 12px from the title
      // (`PageHeading`'s gap) while the badges stay 4px apart between themselves
      <div className="flex items-center gap-1 print:hidden">
        {order.status !== undefined && (
          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
            {getOrderStatusName(order.status)}
          </Badge>
        )}

        {order.payment_status !== undefined && (
          <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
            {getOrderPaymentStatusName(order.payment_status)}
          </Badge>
        )}

        {order.fulfillment_status !== undefined && (
          <Badge
            variant={getFulfillmentStatusBadgeVariant(order.fulfillment_status)}
          >
            {getOrderFulfillmentStatusName(order.fulfillment_status)}
          </Badge>
        )}
      </div>
    )
  },
)
