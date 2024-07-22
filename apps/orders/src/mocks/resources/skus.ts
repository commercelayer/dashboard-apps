import type { Sku } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeSku = (): Sku => {
  return {
    ...makeResource('skus'),
    code: 'CODE1234',
    name: 'HAt'
  }
}
