import {
  Badge,
  type BadgeProps,
  formatDate,
  getShipmentDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Shipment } from "@commercelayer/sdk"
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
          <Text>{resource.stock_location?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Destination",
        kind: "text",
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
  resource: Shipment
  className?: string
}): React.JSX.Element {
  const displayStatus = getShipmentDisplayStatus(resource)
  return (
    <Badge variant={toBadgeVariant(displayStatus.color)} className={className}>
      {displayStatus.label}
    </Badge>
  )
}
