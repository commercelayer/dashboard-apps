import type { Export } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeExport = (): Export => {
  return {
    ...makeResource('exports'),
    resource_type: 'skus',
    status: 'pending',
    format: 'csv'
  }
}
