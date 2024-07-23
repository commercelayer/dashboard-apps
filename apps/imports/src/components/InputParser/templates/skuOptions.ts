import { type SkuOptionCreate } from '@commercelayer/sdk'
import { type CsvTagsColumn, csvTagsColumns } from './_tags'

export const csvSkuOptionTemplate: Array<
  keyof SkuOptionCreate | 'market_id' | CsvTagsColumn
> = [
  'name',
  'currency_code',
  'description',
  'price_amount_cents',
  'delay_hours',
  'sku_code_regex',
  'reference',
  'reference_origin',
  ...csvTagsColumns
]
