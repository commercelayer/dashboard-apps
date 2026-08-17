import {
  Badge,
  formatDate,
  getReturnDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Return } from "@commercelayer/sdk"
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
        kind: "text",
        cell: ({ resource }) => (
          <Text>{resource.stock_location?.name ?? "-"}</Text>
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
  resource: Return
  className?: string
}): React.JSX.Element {
  const displayStatus = getReturnDisplayStatus(resource)
  return (
    <Badge
      variant={getReturnStatusBadgeVariant(displayStatus.color)}
      className={className}
    >
      {displayStatus.label}
    </Badge>
  )
}
