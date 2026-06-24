import type { ListResponse, ShippingCategory } from "@commercelayer/sdk"

import type { CommerceLayerBundle } from "@commercelayer/sdk/bundle"

interface FetchShippingCategoriesConfig {
  sdkClient: CommerceLayerBundle
  hint?: string
}

/**
 * Retrieves organization's shipping categories providing an optional way to filter them by name.
 * @param config - `FetchShippingCategoriesConfig` object containing both sdk client `sdkClient` and an optional search `hint`.
 * @returns a list of resolved `ShippingCategories`.
 */

export const fetchShippingCategories = async ({
  sdkClient,
  hint,
}: FetchShippingCategoriesConfig): Promise<ListResponse<ShippingCategory>> => {
  const list = await sdkClient.shipping_categories.list({
    fields: ["id", "name"],
    pageSize: 10,
    filters:
      hint != null
        ? {
            name_i_cont: hint,
          }
        : undefined,
    sort: {
      name: "asc",
    },
  })
  return list
}
