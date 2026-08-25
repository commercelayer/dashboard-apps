import {
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
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
          // the cell truncates its direct children only, so a two-line cell has
          // to pass truncation down itself or a long reference overflows
          <div className="min-w-0 [&>*]:truncate">
            <Text tag="div" weight="medium" wrap="nowrap">
              #{resource.number}
              {/* the Status column is hidden on mobile, so the badge rides with the name */}
              <ShipmentStatusBadge
                shipment={resource}
                className="md:hidden inline-block align-middle ml-2"
              />
            </Text>
            {/* a reference is optional, and an empty second line would only
                make the row taller for nothing */}
            {!isEmpty(resource.reference) && (
              <Text tag="div" size="x-small" variant="info" wrap="nowrap">
                {resource.reference}
              </Text>
            )}
          </div>
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
