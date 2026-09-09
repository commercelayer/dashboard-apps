import {
  formatDate,
  getStockTransferDisplayStatus,
  ResourceStatusBadge,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"
import { useMemo } from "react"

/**
 * Columns of the stock transfers table.
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
        header: "Origin",
        kind: "text",
        cell: ({ resource }) => (
          <Text>{resource.origin_stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Destination",
        kind: "text",
        cell: ({ resource }) => (
          <Text>{resource.destination_stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Status",
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
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
