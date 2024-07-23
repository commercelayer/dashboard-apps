import type { Price } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makePrice = (): Price => {
  return {
    ...makeResource('prices'),
    sku_code: 'TSHIRTMSB0B0B2000000LXXX',
    currency_code: 'USD',
    amount_cents: 10000
  }
}
