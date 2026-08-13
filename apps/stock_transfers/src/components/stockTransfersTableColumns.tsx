import {
  Badge,
  type BadgeProps,
  formatDate,
  getStockTransferDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
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
          <Text weight="semibold" wrap="nowrap">
            #{resource.number}
          </Text>
        ),
      },
      {
        header: "Origin",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Text>{resource.origin_stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Destination",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Text>{resource.destination_stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Status",
        cell: ({ resource }) => {
          const displayStatus = getStockTransferDisplayStatus(resource)
          return (
            <Badge variant={toBadgeVariant(displayStatus.color)}>
              {displayStatus.label}
            </Badge>
          )
        },
      },
      {
        header: "Updated",
        hideBelow: "md",
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

/** Map the canonical stock transfer display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getStockTransferDisplayStatus>["color"],
): BadgeProps["variant"] {
  switch (color) {
    case "green":
      return "success"
    case "orange":
      return "warning"
    case "red":
      return "danger"
    case "teal":
      return "teal"
    default:
      return "secondary"
  }
}
