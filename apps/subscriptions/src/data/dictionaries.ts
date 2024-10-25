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

type OrderSubscriptionAppStatus =
  | Omit<OrderSubscription['status'], 'draft'>
  | 'failed'
  | undefined

/**
 * Determine the app level order subscription status based on values of some its attributes
 * @param orderSubscription a given orderSubscription object
 * @returns a status string that can be inactive or active or cancelled or failed
 */
export function getOrderSubscriptionStatus(
  orderSubscription: OrderSubscription
): OrderSubscriptionAppStatus {
  if (
    orderSubscription.succeeded_on_last_run === false &&
    orderSubscription.last_run_at != null
  ) {
    return 'failed'
  }
  if (orderSubscription.status !== 'draft') {
    return orderSubscription.status
  }
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
