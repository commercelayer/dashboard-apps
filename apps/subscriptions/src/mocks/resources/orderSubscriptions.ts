import type { OrderSubscription } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeOrderSubscription = (): OrderSubscription => {
  return {
    ...makeResource('order_subscriptions'),
    status: 'active',
    frequency: 'weekly'
  }
}
