import type { CustomerGroup, ListResponse } from "@commercelayer/sdk"
import type { CommerceLayerBundle } from "@commercelayer/sdk/bundle"

interface FetchCustomerGroupsConfig {
  sdkClient: CommerceLayerBundle
  hint?: string
}

/**
 * Retrieves organization's customer groups providing an optional way to filter them by name.
 * @param config - `FetchCustomerGroupsConfig` object containing both sdk client `sdkClient` and an optional search `hint`.
 * @returns a list of resolved `CustomerGroups`.
 */

export const fetchCustomerGroups = async ({
  sdkClient,
  hint,
}: FetchCustomerGroupsConfig): Promise<ListResponse<CustomerGroup>> => {
  const list = await sdkClient.customer_groups.list({
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
