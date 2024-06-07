import type { Customer, CustomerGroup } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeCustomer = (): Customer => {
  return {
    ...makeResource('customers'),
    email: 'john.doe@commercelayer.io',
    status: 'prospect'
  }
}

export const makeCustomerGroup = (): CustomerGroup => {
  return {
    ...makeResource('customer_groups'),
    name: 'Test customer group'
  }
}
