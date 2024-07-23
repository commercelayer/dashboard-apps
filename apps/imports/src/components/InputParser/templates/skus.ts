import { type SkuCreate } from '@commercelayer/sdk'
import {
  csvTagsColumns,
  type CsvTagsColumn
} from '#components/InputParser/templates/_tags'

export const csvSkusTemplate: Array<
  keyof SkuCreate | 'shipping_category_id' | CsvTagsColumn
> = [
  'code',
  'name',
  'shipping_category_id',
  'description',
  'image_url',
  'pieces_per_pack',
  'weight',
  'unit_of_weight',
  'hs_tariff_number',
  'do_not_ship',
  'do_not_track',
  ...csvTagsColumns
]
