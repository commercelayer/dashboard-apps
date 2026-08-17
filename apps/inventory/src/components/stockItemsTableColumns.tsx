import {
  Avatar,
  formatDate,
  formatNumber,
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
              <Text tag="div" weight="medium">
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
        header: "Quantity",
        // the number this table exists for: worth its place on a phone
        hideBelow: "never",
        kind: "count",
        sortBy: "quantity",
        cell: ({ resource }) => (
          <Text weight="medium" wrap="nowrap">
            {formatNumber({ value: resource.quantity, locale: user?.locale })}
          </Text>
        ),
      },
      {
        header: "Reserved",
        kind: "count",
        cell: ({ resource }) => {
          // reserved stock is what makes the available quantity differ from the one
          // on hand, so it only says something when there is any
          const reserved = resource.reserved_stock?.quantity
          if (reserved == null || reserved === 0) {
            return <Text className="text-gray-300">&#8212;</Text>
          }
          return (
            <Text wrap="nowrap">
              {formatNumber({ value: reserved, locale: user?.locale })}
            </Text>
          )
        },
      },
      {
        header: "Stock location",
        kind: "text",
        cell: ({ resource }) => (
          <Text>{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Updated",
        kind: "datetime",
        sortBy: "updated_at",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
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
