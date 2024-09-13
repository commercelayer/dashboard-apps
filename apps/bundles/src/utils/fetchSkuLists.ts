import type {
  CommerceLayerClient,
  ListResponse,
  SkuList
} from '@commercelayer/sdk'

interface FetchSkuListsConfig {
  sdkClient: CommerceLayerClient
  hint?: string
}

/**
 * Retrieves organization's SKU Lists providing an optional way to filter them by name.
 * @param config - `FetchSkuListsConfig` object containing both sdk client `sdkClient` and an optional search `hint`.
 * @returns a list of resolved `SkuLists`.
 */

export const fetchSkuLists = async ({
  sdkClient,
  hint
}: FetchSkuListsConfig): Promise<ListResponse<SkuList>> => {
  const filters: any = {
    manual_true: true
  }
  if (hint != null) {
    filters.name_cont = hint
  }

  const list = await sdkClient.sku_lists.list({
    fields: ['id', 'name'],
    pageSize: 10,
    filters,
    sort: {
      name: 'asc'
    }
  })
  return list
}
