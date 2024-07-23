import {
  type CommerceLayerClient,
  type QueryParamsList
} from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'

const MAX_EXPORTABLE_RECORDS = 10_000

export async function validateRecordsCount({
  sdkClient,
  resourceType,
  filters
}: {
  sdkClient: CommerceLayerClient
  resourceType: AllowedResourceType
  filters?: QueryParamsList['filters']
}): Promise<void> {
  const list = await sdkClient[resourceType].list({ filters })
  if (list.meta.recordCount > MAX_EXPORTABLE_RECORDS) {
    throw Error(
      `Export size must not exceed ${MAX_EXPORTABLE_RECORDS} records. Please refine your filters.`
    )
  }
  if (list.meta.recordCount === 0) {
    throw Error(
      'No records found for selected combination of resource and filters'
    )
  }
}
