import { type CustomerPaymentSourceCreate } from '@commercelayer/sdk'

export const csvCustomerPaymentSourcesTemplate: Array<
  keyof CustomerPaymentSourceCreate | 'customer_id' | 'payment_method_id'
> = [
  'customer_token',
  'payment_source_token',
  'customer_id',
  'payment_method_id'
]
