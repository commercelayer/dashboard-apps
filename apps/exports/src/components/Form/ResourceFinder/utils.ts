import { type InputSelectValue } from '@commercelayer/app-elements/dist/ui/forms/InputSelect'
import type {
  CommerceLayerClient,
  ListResponse,
  QueryArrayFields,
  QueryFilter,
  Resource
} from '@commercelayer/sdk'

export type SearchableResource =
  | 'markets'
  | 'skus'
  | 'price_lists'
  | 'promotions'
  | 'shipping_categories'
  | 'stock_locations'
  | 'tags'

export interface SearchParams<ResType extends SearchableResource> {
  /**
   * signed sdk client
   */
  sdkClient: CommerceLayerClient
  /**
   * the resource we are requesting
   */
  resourceType: ResType
  /**
   * fields to return in search results
   */
  fields?: QueryArrayFields<ListResource<ResType>[number]>
  /**
   * resource field to be used as value in option item
   */
  fieldForValue?: 'code' | 'id'
  /**
   * resource field to be used as label in option item
   */
  fieldForLabel?: 'code' | 'name'
  /**
   * filters to apply to the resource search
   */
  filters?: QueryFilter
}

type ListResource<TResource extends SearchableResource> = Awaited<
  ReturnType<CommerceLayerClient[TResource]['list']>
>

export const fetchResourcesByHint = async <ResType extends SearchableResource>({
  sdkClient,
  hint,
  resourceType,
  fields = ['name', 'id'],
  filters = {},
  fieldForValue,
  fieldForLabel = 'name'
}: SearchParams<ResType> & {
  hint: string
}): Promise<InputSelectValue[]> => {
  const fetchedResources = await sdkClient[resourceType].list({
    fields: fields as QueryArrayFields<Resource>,
    filters: {
      ...filters,
      [`${fieldForLabel}_cont`]: hint
    },
    pageSize: 5
  })
  return adaptApiToSuggestions({
    fetchedResources,
    fieldForValue,
    fieldForLabel
  })
}

export const fetchInitialResources = async <
  ResType extends SearchableResource
>({
  sdkClient,
  resourceType,
  fields = ['name', 'id'],
  filters,
  fieldForValue,
  fieldForLabel
}: SearchParams<ResType>): Promise<InputSelectValue[]> => {
  const fetchedResources = await sdkClient[resourceType].list({
    fields: fields as QueryArrayFields<Resource>,
    pageSize: 25,
    filters
  })
  return adaptApiToSuggestions({
    fetchedResources,
    fieldForValue,
    fieldForLabel
  })
}

interface AdaptSuggestionsParams
  extends Pick<
    SearchParams<SearchableResource>,
    'fieldForLabel' | 'fieldForValue'
  > {
  fetchedResources: ListResponse<
    Resource & { name?: string; code?: string | null; id: string }
  >
}

function adaptApiToSuggestions({
  fetchedResources,
  fieldForValue = 'id',
  fieldForLabel = 'name'
}: AdaptSuggestionsParams): InputSelectValue[] {
  return fetchedResources.map((r) => ({
    value: r[fieldForValue] ?? r.id,
    label: r[fieldForLabel] ?? r.id,
    meta: r
  }))
}
