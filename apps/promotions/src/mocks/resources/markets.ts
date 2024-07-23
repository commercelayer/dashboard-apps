import type { Market } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeMarket = (overrides?: Partial<Market>): Market => {
  return {
    ...makeResource(),
    type: 'markets',
    shared_secret: '',
    name: 'Unknown',
    ...overrides
  }
}
