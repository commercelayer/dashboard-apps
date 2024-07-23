import type { SkuListItem } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeSkuListItem = (): SkuListItem => {
  return {
    ...makeResource('sku_list_items')
  }
}
