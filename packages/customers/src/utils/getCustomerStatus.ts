import type { Customer } from '@commercelayer/sdk'

type CustomerStatus = 'registered' | 'guest'

/**
 * Get customer status based on the boolean value of `has_password` customer's attribute.
 * @param customer - A SDK Customer object.
 * @returns a string containing `registered` or `guest` depending on if `has_password` attribute is `true` or `false.
 */
export const getCustomerStatus = (customer: Customer): CustomerStatus => {
  return customer?.has_password === true ? 'registered' : 'guest'
}
