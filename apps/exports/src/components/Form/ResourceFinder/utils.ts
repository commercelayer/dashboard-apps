import { type InputSelectValue } from '@commercelayer/app-elements/dist/ui/forms/InputSelect'
import type {
  CommerceLayerClient,
  ListResponse,
  QueryArrayFields,
  Resource
} from '@commercelayer/sdk'

export type SearchableResource =
  | 'markets'
  | 'skus'
  | 'price_lists'
  | 'shipping_categories'
  | 'stock_locations'

export interface SearchParams<Res extends SearchableResource> {
  /**
   * signed sdk client
   */
  sdkClient: CommerceLayerClient
  /**
   * the resource we are requesting
   */
  resourceType: Res
  /**
   * fields to return in search results
   */
  fields?: QueryArrayFields<ListResource<Res>[number]>
  /**
   * resource filed to be used as value in option item
   */
  fieldForValue?: 'code' | 'id'
  /**
   * resource filed to be used as label in option item
   */
  fieldForLabel?: 'code' | 'name'
}

type ListResource<TResource extends SearchableResource> = Awaited<
  ReturnType<CommerceLayerClient[TResource]['list']>
>

export const fetchResourcesByHint = async ({
  sdkClient,
  hint,
  resourceType,
  fields = ['name', 'id'],
  fieldForValue,
  fieldForLabel = 'name'
}: SearchParams<SearchableResource> & {
  hint: string
}): Promise<InputSelectValue[]> => {
  const fetchedResources = await sdkClient[resourceType].list({
    fields,
    filters: {
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

export const fetchInitialResources = async ({
  sdkClient,
  resourceType,
  fields = ['name', 'id'],
  fieldForValue,
  fieldForLabel
}: SearchParams<SearchableResource>): Promise<InputSelectValue[]> => {
  const fetchedResources = await sdkClient[resourceType].list({
    fields,
    pageSize: 25
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
