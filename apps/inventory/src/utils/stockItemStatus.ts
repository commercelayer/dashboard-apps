import type { StockItem } from "@commercelayer/sdk"

export type StockItemStatus = "in_stock" | "low_stock" | "out_of_stock"

/**
 * Availability of a stock item, worked out the same way the list filters it,
 * so a badge never disagrees with the filter that brought the row up:
 *
 * - out of stock when nothing is on hand (`quantity_eq: 0`);
 * - low stock when its available quantity (on hand minus reserved) is below the
 *   `low_quantity` threshold, as the `low_stock` scope of the API does — out of
 *   stock items excluded, since that state already says more;
 * - in stock otherwise, including any item with no threshold set.
 *
 * Reads `reserved_stock`, so it has to be included in the query.
 */
export function getStockItemStatus(
  stockItem: Pick<StockItem, "quantity" | "low_quantity" | "reserved_stock">,
): StockItemStatus {
  if (stockItem.quantity <= 0) {
    return "out_of_stock"
  }

  const available =
    stockItem.quantity - (stockItem.reserved_stock?.quantity ?? 0)

  if (stockItem.low_quantity != null && available < stockItem.low_quantity) {
    return "low_stock"
  }

  return "in_stock"
}
