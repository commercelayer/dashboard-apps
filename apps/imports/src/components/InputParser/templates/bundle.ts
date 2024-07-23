import { type BundleCreate } from '@commercelayer/sdk'
import {
  csvTagsColumns,
  type CsvTagsColumn
} from '#components/InputParser/templates/_tags'

export const csvBundleTemplate: Array<
  keyof BundleCreate | 'market_id' | CsvTagsColumn
> = [
  'code',
  'name',
  'currency_code',
  'description',
  'image_url',
  'price_amount_cents',
  'compare_at_amount_cents',
  '_compute_price_amount',
  '_compute_compare_at_amount',
  ...csvTagsColumns
]
