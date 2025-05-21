import type { Order } from '@commercelayer/sdk'
import isEmpty from 'lodash-es/isEmpty'
import type { SetNonNullable, SetRequired } from 'type-fest'

export function hasPaymentMethod(
  order: Order
): order is SetRequired<
  SetNonNullable<Order, 'payment_method'>,
  'payment_method'
> {
  return order.payment_method?.name != null
}

/**
 * Check if the order has async pending captures.
 * We assume that async pending captures are those transactions that are not
 * succeeded and have no message or error code.
 */
export function orderHasAsyncPendingCaptures(order: Order): boolean {
  const asyncPendingCaptures = (order?.transactions ?? [])?.filter(
    (t) =>
      t.type === 'captures' &&
      !t.succeeded &&
      isEmpty(t.message) &&
      isEmpty(t.error_code)
  )
  return asyncPendingCaptures.length > 0
}
