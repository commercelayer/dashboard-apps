import type { PriceList } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makePriceList = (overrides?: Partial<PriceList>): PriceList => {
  return {
    ...makeResource(),
    type: 'price_lists',
    currency_code: 'USD',
    name: '',
    ...overrides
  }
}
