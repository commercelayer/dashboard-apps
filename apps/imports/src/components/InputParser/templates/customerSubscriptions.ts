import { type CustomerSubscriptionCreate } from '@commercelayer/sdk'

export const csvCustomerSubscriptionsTemplate: Array<
  keyof CustomerSubscriptionCreate
> = ['customer_email', 'reference']
