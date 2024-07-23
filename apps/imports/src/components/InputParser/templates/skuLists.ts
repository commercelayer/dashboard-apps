import { type SkuListCreate } from '@commercelayer/sdk'

export const csvSkuListTemplate: Array<
  keyof SkuListCreate | 'sku_list_items.sku_code'
> = [
  'name',
  'description',
  'image_url',
  'manual',
  'sku_code_regex',
  'sku_list_items.sku_code'
]
