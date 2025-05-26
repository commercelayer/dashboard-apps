import type { Order } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'

export function hasPaymentMethod(
  order: Order
): order is SetRequired<
  SetNonNullable<Order, 'payment_method'>,
  'payment_method'
> {
  return order.payment_method?.name != null
}
