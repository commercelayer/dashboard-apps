import type { TriggerAttribute } from '@commercelayer/app-elements'
import type {
  OrderSubscription,
  OrderSubscriptionUpdate
} from '@commercelayer/sdk'

type ActionVariant = 'primary' | 'secondary'

interface TriggerAction {
  triggerAttribute: UITriggerAttributes
  variant?: ActionVariant
  hidden?: true
}

export function getOrderSubscriptionTriggerAction(
  orderSubscription: OrderSubscription
): TriggerAction | undefined {
  const status = orderSubscription.status
  switch (status) {
    case 'inactive':
      return { triggerAttribute: '_activate' }
    case 'active':
      return { triggerAttribute: '_deactivate' }
    default:
      return undefined
  }
}

type UITriggerAttributes = Extract<
  TriggerAttribute<OrderSubscriptionUpdate>,
  '_activate' | '_deactivate' | '_cancel'
>

export function getOrderSubscriptionTriggerActionName(
  triggerAttribute: UITriggerAttributes
): string {
  const dictionary: Record<typeof triggerAttribute, string> = {
    _activate: 'Activate',
    _deactivate: 'Deactivate',
    _cancel: 'Cancel'
  }

  return dictionary[triggerAttribute]
}
