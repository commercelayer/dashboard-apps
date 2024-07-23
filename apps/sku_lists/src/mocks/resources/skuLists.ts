import type { SkuList } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeSkuList = (): SkuList => {
  return {
    ...makeResource('sku_lists'),
    slug: 'test-slug',
    name: 'Gray Men T-Shirt with Black Logo (L)'
  }
}
