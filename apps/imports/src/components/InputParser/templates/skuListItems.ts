import { type SkuListItemCreate } from '@commercelayer/sdk'

export const csvSkuListItemsTemplate: Array<
  keyof SkuListItemCreate | 'sku_id'
> = ['sku_id', 'quantity', 'position']
