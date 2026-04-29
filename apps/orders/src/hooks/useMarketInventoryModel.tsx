import { useCoreApi } from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"

export function useMarketInventoryModel(marketId?: string) {
  const { data: inventoryModel, isLoading } = useCoreApi(
    "markets",
    "inventory_model",
    marketId != null && !isEmpty(marketId)
      ? [
          marketId,
          {
            include: ["inventory_return_locations.stock_location.address"],
          },
        ]
      : null,
  )

  return { inventoryModel, isLoading }
}
