import {
  Badge,
  type BadgeProps,
  formatDate,
  getShipmentDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the shipments table.
 *
 * Requires `include: ['stock_location', 'shipping_address']` in the query.
 */
export function useShipmentsTableColumns(): Array<
  ResourceTableColumn<"shipments">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Shipment",
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
        cell: ({ resource }) => (
          <Text>{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Destination",
        hideBelow: "md",
        cell: ({ resource }) => {
          const address = resource.shipping_address
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
        header: "Status",
        sortBy: "status",
        cell: ({ resource }) => {
          const displayStatus = getShipmentDisplayStatus(resource)
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

/** Map the canonical shipment display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getShipmentDisplayStatus>["color"],
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
