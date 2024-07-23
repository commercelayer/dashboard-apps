import type { PriceList } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makePriceList = (): PriceList => {
  return {
    ...makeResource('price_lists'),
    name: 'WorldWide',
    currency_code: 'USD'
  }
}
