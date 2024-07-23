import type { Customer } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeCustomer = (): Customer => {
  return {
    ...makeResource('customers'),
    email: 'john.doe@commercelayer.io',
    status: 'prospect'
  }
}
