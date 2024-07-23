import { type InputSelectValue } from '@commercelayer/app-elements/dist/ui/forms/InputSelect'
import type {
  CommerceLayerClient,
  ListResponse,
  Resource
} from '@commercelayer/sdk'
import { type AllowedParentResource, type AllowedResourceType } from 'App'

/**
 * Retrieve a list of resources from api filtered by hint if provided.
 * @param sdkClient a valid SDK client
 * @param resourceType a valid resource type
 * @param hint (optional) text to be used as filter value
 * @returns a promise that resolves a list of resources
 */
export const fetchResources = async ({
  sdkClient,
  resourceType,
  hint
}: {
  sdkClient: CommerceLayerClient
  resourceType: AllowedResourceType | AllowedParentResource
  hint?: string
}): Promise<InputSelectValue[]> => {
  // @ts-expect-error Expression produces a union type that is too complex to represent
  const fetchedResources = await sdkClient[resourceType].list({
    filters:
      hint != null
        ? {
            name_cont: hint
          }
        : undefined,
    pageSize: 25,
    // @ts-expect-error Expression produces a union type that is too complex to represent
    sort: {
      created_at: 'desc'
    }
  })
  return adaptApiToSuggestions(fetchedResources)
}

/**
 * Simple adapter to transform api raw data into value/label objects
 * to be used as select values
 * @param fetchedResources the resource that has been returned from api (sdk request)
 * @returns an array of objects containing `value` and `label` keys
 */
function adaptApiToSuggestions(
  fetchedResources: ListResponse<Resource & { name?: string | null }>
): InputSelectValue[] {
  return fetchedResources.map((r) => {
    const label = 'name' in r && r.name != null ? r.name : r.id
    return {
      label,
      value: r.id
    }
  })
}
