import { repeat } from '#mocks'
import type { Return } from '@commercelayer/sdk'
import { makeResource } from '../resource'

import { makeCustomer } from './customers'
import { makeOrder } from './orders'
import { makeReturnLineItem } from './return_line_items'

export const makeReturn = (): Return => {
  return {
    ...makeResource('returns'),
    status: 'draft',
    return_line_items: repeat(1, () => makeReturnLineItem()),
    order: makeOrder(),
    customer: makeCustomer()
  }
}
