import { subscriptionFailedOnLastRun } from '#utils/subscriptionFailedOnLastRun'
import type { OrderSubscription } from '@commercelayer/sdk'

type SubscriptionAppStatus =
  | Omit<OrderSubscription['status'], 'draft'>
  | 'failed'
  | undefined

/**
 * Determine the app level order subscription status based on values of some its attributes
 * @param orderSubscription a given orderSubscription object
 * @returns a status string that can be inactive or active or cancelled or failed
 */
export function getSubscriptionStatus(
  orderSubscription: OrderSubscription
): SubscriptionAppStatus {
  if (subscriptionFailedOnLastRun(orderSubscription)) {
    return 'failed'
  }
  if (orderSubscription.status !== 'draft') {
    return orderSubscription.status
  }
}
