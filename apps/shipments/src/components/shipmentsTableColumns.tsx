import {
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import { ShipmentStatusBadge } from "#components/ShipmentStatusBadge"

/**
 * Columns of the shipments table.
 *
 * NUMBER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Reference and Tags hidden until
 * they are turned on.
 *
 * Requires `include: ['stock_location', 'shipping_address', 'tags']` in the query.
 */
export function useShipmentsTableColumns(): Array<
  ResourceTableColumn<"shipments">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Number",
        // the number alone: an identifier's share of the table, as on orders
        kind: "code",
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
            {/* mobile only: from `md` up the reference has a column of its own.
                It is optional, and an empty second line would only make the
                row taller for nothing */}
            {!isEmpty(resource.reference) && (
              <Text
                tag="div"
                size="x-small"
                variant="info"
                wrap="nowrap"
                className="md:hidden"
              >
                {resource.reference}
              </Text>
            )}
          </div>
        ),
      },
      {
        id: "origin",
        header: "Origin",
        kind: "text",
        hideable: true,
        cell: ({ resource }) =>
          resource.stock_location?.name != null ? (
            <Text>{resource.stock_location?.name}</Text>
          ) : (
            <Text variant="disabled">&#8212;</Text>
          ),
      },
      {
        id: "destination",
        header: "Destination",
        kind: "text",
        hideable: true,
        cell: ({ resource }) => {
          const address = resource.shipping_address
          if (address?.city == null) {
            return <Text variant="disabled">&#8212;</Text>
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
        id: "status",
        header: "Status",
        kind: "status",
        sortBy: "status",
        hideable: true,
        cell: ({ resource }) => <ShipmentStatusBadge shipment={resource} />,
      },
      {
        id: "updated",
        header: "Updated",
        kind: "datetime",
        sortBy: "updated_at",
        hideable: true,
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
      {
        id: "tags",
        header: "Tags",
        kind: "text",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => <TableTagsCell tags={resource.tags} />,
      },
    ],
    [user?.timezone, user?.locale],
  )
}
