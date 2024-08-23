import type { ReturnLineItem } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeReturnLineItem = (): ReturnLineItem => {
  return {
    ...makeResource('return_line_items'),
    sku_code: Math.random().toString(),
    image_url:
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    name: 'I do not know the name of the product',
    quantity: 1,
    return_reason: ['The product received does not match what I ordered.'],
    total_amount_float: 10
  }
}
