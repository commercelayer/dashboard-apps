import {
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"
import { ShipmentStatusBadge } from "#components/ShipmentStatusBadge"

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
            <ShipmentStatusBadge
              shipment={resource}
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
        cell: ({ resource }) => <ShipmentStatusBadge shipment={resource} />,
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
