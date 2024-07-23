import type { ShippingMethod } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeShippingMethod = (): ShippingMethod => {
  return {
    ...makeResource('shipping_methods'),
    name: 'standard shipping',
    price_amount_cents: 7
  }
}
