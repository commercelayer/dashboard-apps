import {
  Avatar,
  formatDate,
  formatNumber,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the stock items table.
 *
 * SKU is the primary column, always shown; the others can be hidden by the user
 * from the columns menu (`hideable`), with Reference hidden until it is turned
 * on.
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
            <div className="min-w-0 [&>*]:truncate">
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
        id: "quantity",
        header: "Quantity",
        hideable: true,
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
        id: "reserved",
        header: "Reserved",
        hideable: true,
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
        id: "stock_location",
        header: "Stock location",
        hideable: true,
        kind: "text",
        cell: ({ resource }) => (
          <Text>{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        hideable: true,
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
      {
        id: "reference",
        header: "Reference",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          isEmpty(resource.reference) ? (
            <Text>-</Text>
          ) : (
            <Text wrap="nowrap">{resource.reference}</Text>
          ),
      },
    ],
    [user?.timezone, user?.locale],
  )
}
