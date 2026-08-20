import type { OrderSubscription } from "@commercelayer/sdk"

/**
 * The standard subscription title for the whole application (eg. `Subscription #123`).
 *
 * The market used to stand in for the resource name here; it is a fact about the
 * subscription like any other, so it sits in the details page's info block and the
 * title says what the page is about.
 * @param subscription - required `OrderSubscription` object.
 * @returns string containing calculated subscription title.
 */
export const getSubscriptionTitle = (subscription: OrderSubscription): string =>
  `Subscription #${subscription.number}`
