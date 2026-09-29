import {
  Badge,
  formatDate,
  getReturnDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Return } from "@commercelayer/sdk"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import { getReturnStatusBadgeVariant } from "#data/dictionaries"

/**
 * Columns of the returns table.
 *
 * A return travels the opposite way to a shipment, so Origin is the customer's
 * address and Destination the warehouse it goes back to.
 *
 * NUMBER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Customer, Reference and Tags
 * hidden until they are turned on.
 *
 * Requires `include: ['origin_address', 'stock_location', 'tags']` in the query,
 * and `customer_email` and `reference` among the sparse fields.
 */
export function useReturnsTableColumns(): Array<
  ResourceTableColumn<"returns">
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
        id: "origin",
        header: "Origin",
        kind: "text",
        hideable: true,
        cell: ({ resource }) => {
          const address = resource.origin_address
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
        id: "destination",
        header: "Destination",
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
        id: "status",
        header: "Status",
        kind: "status",
        sortBy: "status",
        hideable: true,
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
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
        id: "customer",
        header: "Customer",
        kind: "text",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          isEmpty(resource.customer_email) ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text>{resource.customer_email}</Text>
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
