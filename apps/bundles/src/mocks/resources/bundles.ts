import type { Bundle } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeBundle = (): Bundle => {
  return {
    ...makeResource('bundles'),
    code: 'TSHIRTMSB0B0B2000000LXXX',
    name: 'Gray Men T-Shirt with Black Logo (L)'
  }
}
