import type { LineItem } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeLineItem = (): LineItem => {
  return {
    ...makeResource('line_items'),
    tax_amount_float: 0,
    total_amount_float: 0,
    item_type: 'skus',
    sku_code: Math.random().toString(),
    image_url:
      'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    name: 'I do not know the name of the product',
    quantity: 1,
    formatted_total_amount: '€10.00',
    formatted_unit_amount: '€10.00',
    compare_at_amount_cents: 0,
    compare_at_amount_float: 0,
    formatted_compare_at_amount: '€0.00'
  }
}
