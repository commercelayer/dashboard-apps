import type { OrderSubscription } from '@commercelayer/sdk'

/**
 * Determine if a given order subscription failed on last run
 * @param orderSubscription a given orderSubscription object
 * @returns a boolean flag
 */
export function subscriptionFailedOnLastRun(
  orderSubscription: OrderSubscription
): boolean {
  return (
    orderSubscription.succeeded_on_last_run === false &&
    orderSubscription.last_run_at != null
  )
}
