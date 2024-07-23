import type { Sku } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeSku = (): Sku => {
  return {
    ...makeResource('skus'),
    code: 'TSHIRTMSB0B0B2000000LXXX',
    name: 'Gray Men T-Shirt with Black Logo (L)'
  }
}
