import type { BadgeProps, TriggerAttribute } from "@commercelayer/app-elements"
import type {
  OrderSubscription,
  OrderSubscriptionUpdate,
} from "@commercelayer/sdk"

type ActionVariant = "primary" | "secondary"

interface TriggerAction {
  triggerAttribute: UITriggerAttributes
  variant?: ActionVariant
  hidden?: true
}

export function getOrderSubscriptionTriggerAction(
  orderSubscription: OrderSubscription,
): TriggerAction | undefined {
  const status = orderSubscription.status
  switch (status) {
    // @ts-expect-error `pending` is not yet in the SDK status union (beta.9)
    case "pending":
    case "inactive":
      return { triggerAttribute: "_activate" }
    case "active":
      return { triggerAttribute: "_deactivate" }
    default:
      return undefined
  }
}

type UITriggerAttributes = Extract<
  TriggerAttribute<OrderSubscriptionUpdate>,
  "_activate" | "_deactivate" | "_cancel"
>

export function getOrderSubscriptionTriggerActionName(
  triggerAttribute: UITriggerAttributes,
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _activate: "Activate",
    _deactivate: "Deactivate",
    _cancel: "Cancel",
  }

  return dictionary[triggerAttribute]
}

/**
 * Badge variant for a subscription status. `pending` is recoverable rather than
 * broken — it warns; the terminal and dormant states are neutral.
 */
export function getSubscriptionStatusBadgeVariant(
  status: OrderSubscription["status"],
): BadgeProps["variant"] {
  switch (status) {
    case "active":
    case "running":
      return "success"
    // @ts-expect-error `pending` is supported by the API but not yet in the SDK status union (beta.9)
    case "pending":
      return "warning"
    default:
      return "secondary"
  }
}

export function getSubscriptionStatusName(
  status: OrderSubscription["status"],
): string {
  switch (status) {
    case "active":
      return "Active"
    case "running":
      return "Running"
    // @ts-expect-error `pending` is supported by the API but not yet in the SDK status union (beta.9)
    case "pending":
      return "Pending"
    case "inactive":
      return "Inactive"
    case "draft":
      return "Draft"
    case "cancelled":
      return "Cancelled"
    default:
      return ""
  }
}
