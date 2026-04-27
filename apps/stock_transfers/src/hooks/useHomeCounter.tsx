import { useCoreApi } from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"

export function useHomeCounter(status: StockTransfer["status"]) {
  const { data, isLoading } = useCoreApi("stock_transfers", "list", [
    {
      filters: { status_eq: status },
      fields: ["id", "status"],
      pageSize: 1,
    },
  ])

  return { data, isLoading }
}
