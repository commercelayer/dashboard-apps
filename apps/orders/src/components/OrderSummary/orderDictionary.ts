import type { TriggerAttribute } from '@commercelayer/app-elements'
import type { Order, OrderUpdate } from '@commercelayer/sdk'

type UITriggerAttributes = Extract<
  TriggerAttribute<OrderUpdate>,
  '_approve' | '_cancel' | '_capture' | '_refund' | '_archive' | '_unarchive'
>

export function getTriggerAttributes(order: Order): UITriggerAttributes[] {
  const archiveTriggerAttribute: Extract<
    UITriggerAttributes,
    '_archive' | '_unarchive'
  > = order.archived_at == null ? '_archive' : '_unarchive'

  const combinedStatus =
    `${order.status}:${order.payment_status}:${order.fulfillment_status}` as const

  if (order.status === 'editing') {
    return []
  }

  switch (combinedStatus) {
    case 'placed:authorized:unfulfilled':
    case 'placed:authorized:not_required':
    case 'placed:paid:unfulfilled':
    case 'placed:paid:not_required':
    case 'placed:partially_refunded:unfulfilled':
    case 'placed:partially_refunded:not_required':
    case 'placed:free:unfulfilled':
    case 'placed:free:not_required':
      return ['_approve', '_cancel']

    case 'placed:unpaid:unfulfilled':
      return ['_cancel']

    case 'approved:authorized:unfulfilled':
    case 'approved:authorized:not_required':
    case 'approved:authorized:in_progress':
      return ['_capture']

    case 'approved:paid:in_progress':
    case 'approved:partially_refunded:in_progress':
      return ['_refund']

    case 'approved:paid:fulfilled':
    case 'approved:partially_refunded:fulfilled':
      return ['_refund', archiveTriggerAttribute]

    case 'approved:free:fulfilled': // TODO: This could be a gift-card and what If i do return?
    case 'cancelled:refunded:fulfilled':
      return [archiveTriggerAttribute]

    case 'approved:paid:not_required':
    case 'approved:partially_refunded:not_required':
      return ['_refund', archiveTriggerAttribute]

    case 'approved:free:not_required':
    case 'cancelled:voided:unfulfilled':
    case 'cancelled:refunded:unfulfilled':
    case 'cancelled:refunded:not_required':
    case 'cancelled:unpaid:unfulfilled':
    case 'cancelled:free:unfulfilled':
      return [archiveTriggerAttribute]

    default:
      return []
  }
}

export function getTriggerAttributeName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _approve: 'Approve',
    _archive: 'Archive',
    _cancel: 'Cancel order',
    _capture: 'Capture payment',
    _refund: 'Refund',
    _unarchive: 'Unarchive'
  }

  return dictionary[triggerAttribute]
}
