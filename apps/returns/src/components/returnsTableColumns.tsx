import {
  Badge,
  formatDate,
  getReturnDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"
import { getReturnStatusBadgeVariant } from "#data/dictionaries"

/**
 * Columns of the returns table.
 *
 * A return travels the opposite way to a shipment, so Origin is the customer's
 * address and Destination the warehouse it goes back to.
 *
 * Requires `include: ['origin_address', 'stock_location']` in the query.
 */
export function useReturnsTableColumns(): Array<
  ResourceTableColumn<"returns">
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
          </Text>
        ),
      },
      {
        header: "Origin",
        hideBelow: "md",
        cell: ({ resource }) => {
          const address = resource.origin_address
          if (address?.city == null) {
            return <Text>-</Text>
          }
          return (
            <Text>
              {address.city}
              {address.country_code != null ? ` (${address.country_code})` : ""}
            </Text>
          )
        },
      },
      {
        header: "Destination",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Text>{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Status",
        sortBy: "status",
        cell: ({ resource }) => {
          const displayStatus = getReturnDisplayStatus(resource)
          return (
            <Badge variant={getReturnStatusBadgeVariant(displayStatus.color)}>
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
