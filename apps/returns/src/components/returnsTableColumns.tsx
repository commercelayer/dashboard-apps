import {
  Badge,
  type BadgeProps,
  formatDate,
  getReturnDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

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
          <Text weight="semibold" wrap="nowrap">
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
            return <Text variant="info">-</Text>
          }
          return (
            <Text variant="info">
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
          <Text variant="info">{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Status",
        cell: ({ resource }) => {
          const displayStatus = getReturnDisplayStatus(resource)
          return (
            <Badge variant={toBadgeVariant(displayStatus.color)}>
              {displayStatus.label}
            </Badge>
          )
        },
      },
      {
        header: "Updated",
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

/** Map the canonical return display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getReturnDisplayStatus>["color"],
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
