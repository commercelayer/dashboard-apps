import {
  csvTagsColumns,
  type CsvTagsColumn
} from '#components/InputParser/templates/_tags'
import { type LineItemCreate } from '@commercelayer/sdk'

export const csvLineItemsTemplate: Array<
  keyof LineItemCreate | 'order_id' | CsvTagsColumn
> = [
  'item_type',
  'name',
  'unit_amount_cents',
  'sku_code',
  'quantity',
  'order_id',
  ...csvTagsColumns
]
