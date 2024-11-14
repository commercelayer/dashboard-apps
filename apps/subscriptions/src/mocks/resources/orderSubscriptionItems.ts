import type { OrderSubscriptionItem } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeOrderSubscriptionItem = (): OrderSubscriptionItem => {
  return {
    ...makeResource('order_subscription_items'),
    quantity: 1,
    total_amount_float: 0
  }
}
