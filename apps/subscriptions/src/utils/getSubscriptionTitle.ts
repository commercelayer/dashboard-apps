import type { OrderSubscription } from '@commercelayer/sdk'

/**
 * Generates a standard subscription title suitable for the whole application (eg. `US Market #123`).
 * @param subscription - required `OrderSubscription` object.
 * @returns string containing calculated subscription title.
 */

export const getSubscriptionTitle = (
  subscription: OrderSubscription
): string => {
  const subscriptionTitleMarket =
    subscription.market?.name != null
      ? `${subscription.market.name}`
      : 'Subscription'
  return `${subscriptionTitleMarket} #${subscription.number}`
}
