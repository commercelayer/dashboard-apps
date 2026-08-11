import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the stock items table.
 *
 * Requires `include: ['sku', 'stock_location', 'reserved_stock']` in the query.
 */
export function useStockItemsTableColumns(): Array<
  ResourceTableColumn<"stock_items">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "SKU",
        cell: ({ resource }) => (
          <div className="flex items-center gap-4">
            <Avatar
              alt={resource.sku?.name ?? ""}
              src={resource.sku?.image_url as `https://${string}`}
              size="small"
            />
            <div>
              <Text tag="div" weight="semibold">
                {resource.sku?.name}
              </Text>
              <Text tag="div" weight="medium" size="x-small" variant="info">
                {resource.sku?.code}
              </Text>
            </div>
          </div>
        ),
      },
      {
        header: "Stock location",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Text variant="info">{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Quantity",
        align: "right",
        sortBy: "quantity",
        cell: ({ resource }) => (
          <div>
            <Text tag="div" weight="semibold" wrap="nowrap">
              {resource.quantity}
            </Text>
            {resource.reserved_stock != null &&
              resource.reserved_stock.quantity > 0 && (
                // reserved stock is what makes the available quantity differ from
                // the one on hand, so it stays visible as the list row had it
                <Text tag="div" size="small" variant="info" wrap="nowrap">
                  {resource.reserved_stock.quantity} reserved
                </Text>
              )}
          </div>
        ),
      },
      {
        header: "Updated at",
        align: "right",
        hideBelow: "md",
        sortBy: "updated_at",
        cell: ({ resource }) => (
          <Text variant="info" wrap="nowrap">
            {formatDate({
              format: "full",
              isoDate: resource.updated_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
    ],
    [user?.timezone, user?.locale],
  )
}
