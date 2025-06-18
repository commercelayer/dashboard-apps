import { type SkuListItemCreate } from '@commercelayer/sdk'

export const csvSkuListItemsTemplate: Array<keyof SkuListItemCreate> = [
  'sku_code',
  'quantity',
  'position'
]
