import type { Import } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeImport = (): Import => {
  return {
    ...makeResource('imports'),
    resource_type: 'skus',
    status: 'pending',
    format: 'csv',
    inputs: []
  }
}
