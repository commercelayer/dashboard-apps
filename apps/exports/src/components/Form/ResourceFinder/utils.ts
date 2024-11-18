import { type TokenProviderAuthUser } from '@commercelayer/app-elements/dist/providers/TokenProvider/types'
import { type InputSelectValue } from '@commercelayer/app-elements/dist/ui/forms/InputSelect'
import type {
  CommerceLayerClient,
  ListResponse,
  QueryArrayFields,
  Resource
} from '@commercelayer/sdk'
import { getExcludedPriceList } from 'dashboard-apps-common/src/utils/getExcludedPriceList'
import { getUserDomain } from 'dashboard-apps-common/src/utils/userUtils'

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

const getShippingCategoryId = async (
  sdkClient: CommerceLayerClient,
  user: TokenProviderAuthUser | null
): Promise<string> => {
  const list = await sdkClient.shipping_categories.list({
    sort: { created_at: 'desc' },
    filters: {
      metadata_jcont: {
        domain: getUserDomain(user, import.meta.env.PUBLIC_TEST_USERS) ?? ''
      }
    }
  })
  return list?.[0]?.id ?? null
}

export const fetchInitialResources = async ({
  sdkClient,
  resourceType,
  fields = ['name', 'id'],
  fieldForValue,
  fieldForLabel,
  user
}: SearchParams<SearchableResource> & {
  user: TokenProviderAuthUser | null
}): Promise<InputSelectValue[]> => {
  const shippingCategoryId = await getShippingCategoryId(sdkClient, user)
  let filters

  if (shippingCategoryId !== null && shippingCategoryId !== undefined) {
    if (resourceType === 'skus') {
      filters = {
        shipping_category_id_eq: shippingCategoryId
      }
    }

    if (resourceType === 'price_lists') {
      filters = {
        id_not_in:
          user != null
            ? getExcludedPriceList(
                user,
                import.meta.env.PUBLIC_TEST_USERS
              ).join(',')
            : ''
      }
    }

    if (resourceType === 'shipping_categories') {
      filters = {
        id_eq: shippingCategoryId
      }
    }
  }

  const fetchedResources = await sdkClient[resourceType].list({
    fields,
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
