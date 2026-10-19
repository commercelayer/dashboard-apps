import {
  Badge,
  type BadgeProps,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { StockItem } from "@commercelayer/sdk"
import {
  getStockItemStatus,
  type StockItemStatus,
} from "#utils/stockItemStatus"

const badges: Record<
  StockItemStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  in_stock: { label: "in stock", variant: "success" },
  low_stock: { label: "low stock", variant: "warning" },
  out_of_stock: { label: "out of stock", variant: "danger" },
}

/**
 * Availability of a stock item: in stock, low stock or out of stock.
 *
 * Reads `reserved_stock`, so it has to be included in the query.
 */
export const BadgeStockItemStatus = withSkeletonTemplate<{
  stockItem: Pick<StockItem, "quantity" | "low_quantity" | "reserved_stock">
}>(({ stockItem }) => {
  const { label, variant } = badges[getStockItemStatus(stockItem)]
  return <Badge variant={variant}>{label}</Badge>
})
