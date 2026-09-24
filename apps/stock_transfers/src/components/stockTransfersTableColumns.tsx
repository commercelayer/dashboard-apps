import {
  formatDate,
  formatNumber,
  getStockTransferDisplayStatus,
  ResourceStatusBadge,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the stock transfers table.
 *
 * NUMBER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Quantity, SKU code and
 * Reference hidden until they are turned on (`quantity`, `sku_code` and
 * `reference` must be among the sparse fields).
 *
 * Requires `include: ['origin_stock_location', 'destination_stock_location']` in
 * the query: a transfer moves stock between two locations, so both ends are names.
 */
export function useStockTransfersTableColumns(): Array<
  ResourceTableColumn<"stock_transfers">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Number",
        sortBy: "number",
        cell: ({ resource }) => (
          <Text weight="medium" wrap="nowrap">
            #{resource.number}
            {/* the Status column is hidden on mobile, so the badge rides with the name */}
            <RowStatusBadge
              resource={resource}
              className="md:hidden inline-block align-middle ml-2"
            />
          </Text>
        ),
      },
      {
        id: "origin",
        header: "Origin",
        hideable: true,
        kind: "text",
        cell: ({ resource }) =>
          resource.origin_stock_location?.name != null ? (
            <Text>{resource.origin_stock_location?.name}</Text>
          ) : (
            <Text variant="disabled">&#8212;</Text>
          ),
      },
      {
        id: "destination",
        header: "Destination",
        hideable: true,
        kind: "text",
        cell: ({ resource }) =>
          resource.destination_stock_location?.name != null ? (
            <Text>{resource.destination_stock_location?.name}</Text>
          ) : (
            <Text variant="disabled">&#8212;</Text>
          ),
      },
      {
        id: "status",
        header: "Status",
        hideable: true,
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
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
        id: "quantity",
        header: "Quantity",
        kind: "count",
        sortBy: "quantity",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatNumber({ value: resource.quantity, locale: user?.locale })}
          </Text>
        ),
      },
      {
        id: "sku_code",
        header: "SKU code",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          isEmpty(resource.sku_code) ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.sku_code}</Text>
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
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.reference}</Text>
          ),
      },
    ],
    [user?.timezone, user?.locale],
  )
}

/**
 * The row's status badge.
 *
 * Shared by the Status column and, on mobile where that column is hidden, the name
 * cell — so the two can never drift apart.
 */
function RowStatusBadge({
  resource,
  className,
}: {
  resource: StockTransfer
  className?: string
}): React.JSX.Element {
  const displayStatus = getStockTransferDisplayStatus(resource)
  return <ResourceStatusBadge status={displayStatus} className={className} />
}
