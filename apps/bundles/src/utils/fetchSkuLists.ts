import type {
  CommerceLayerBundle,
  ListResponse,
  SkuList,
} from "@commercelayer/sdk"

interface FetchSkuListsConfig {
  sdkClient: CommerceLayerBundle
  hint?: string
  pageNumber?: number
}

/**
 * Retrieves organization's SKU Lists providing an optional way to filter them by name.
 * @param config - `FetchSkuListsConfig` object containing the sdk client `sdkClient`, an optional search `hint` and the `pageNumber` to load.
 * @returns a list of resolved `SkuLists`.
 */

export const fetchSkuLists = async ({
  sdkClient,
  hint,
  pageNumber = 1,
}: FetchSkuListsConfig): Promise<ListResponse<SkuList>> => {
  const filters: any = {
    manual_true: true,
  }
  // an empty hint means every sku list, so no predicate is added for it
  if (hint != null && hint !== "") {
    filters.name_i_cont = hint
  }

  const list = await sdkClient.sku_lists.list({
    fields: ["id", "name"],
    pageSize: 25,
    pageNumber,
    filters,
    sort: {
      name: "asc",
    },
  })
  return list
}
