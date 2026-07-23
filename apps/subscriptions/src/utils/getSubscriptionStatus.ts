import type { OrderSubscription } from "@commercelayer/sdk"
import { subscriptionFailedOnLastRun } from "#utils/subscriptionFailedOnLastRun"

type SubscriptionAppStatus =
  | Omit<OrderSubscription["status"], "draft">
  | "failed"
  | undefined

/**
 * Determine the app level order subscription status based on values of some its attributes
 * @param orderSubscription a given orderSubscription object
 * @returns a status string that can be inactive or active or cancelled or failed
 */
export function getSubscriptionStatus(
  orderSubscription: OrderSubscription,
): SubscriptionAppStatus {
  // `pending` wins over the derived `failed` state: a subscription can reach
  // `pending` via a renewal that failed for lack of a usable wallet, so it may
  // carry `succeeded_on_last_run === false` while being in the recoverable
  // `pending` status. Surface `pending` rather than masking it as failed.
  // @ts-expect-error `pending` is not yet in the SDK status union (beta.9)
  if (orderSubscription.status === "pending") {
    return orderSubscription.status
  }
  if (subscriptionFailedOnLastRun(orderSubscription)) {
    return "failed"
  }
  if (orderSubscription.status !== "draft") {
    return orderSubscription.status
  }
}
