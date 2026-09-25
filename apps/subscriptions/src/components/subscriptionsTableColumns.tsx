import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import {
  getSubscriptionStatusBadgeVariant,
  getSubscriptionStatusName,
} from "#data/dictionaries"
import { subscriptionFailedOnLastRun } from "#utils/subscriptionFailedOnLastRun"

/**
 * Columns of the subscriptions table.
 *
 * NUMBER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Next run, Frequency, Created,
 * Reference and Tags hidden until they are turned on.
 *
 * Requires `include: ['customer', 'source_order', 'source_order.billing_address',
 * 'tags']`
 * in the query: the customer column shows the name on the source order's billing
 * address, which is the only place a subscription carries one.
 */
export function useSubscriptionsTableColumns(): Array<
  ResourceTableColumn<"order_subscriptions">
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
            <Badge
              variant={getSubscriptionStatusBadgeVariant(resource.status)}
              className="md:hidden inline-block align-middle ml-2"
            >
              {getSubscriptionStatusName(resource.status)}
            </Badge>
          </Text>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        hideable: true,
        kind: "text",
        cell: ({ resource }) => {
          const address = resource.source_order?.billing_address
          const name = address?.full_name ?? resource.customer_email
          if (name == null) {
            return <Text variant="disabled">&#8212;</Text>
          }
          return (
            <Text>
              {name}
              {address?.country_code != null
                ? ` (${address.country_code})`
                : ""}
            </Text>
          )
        },
      },
      {
        id: "status",
        header: "Status",
        hideable: true,
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => (
          <Badge variant={getSubscriptionStatusBadgeVariant(resource.status)}>
            {getSubscriptionStatusName(resource.status)}
          </Badge>
        ),
      },
      {
        id: "last_run",
        header: "Last run",
        hideable: true,
        kind: "datetime",
        // last column, left aligned: without this the table's leftover width
        // collects to its right. `w-px` cannot be honoured, so the column shrinks
        sortBy: "last_run_at",
        cell: ({ resource }) => {
          if (resource.last_run_at == null) {
            return <Text variant="disabled">&#8212;</Text>
          }
          return (
            // the badge only shows for a failed run, so a healthy list stays quiet.
            // No `justify-*`: flex already starts at the left, and `justify-start`
            // is not in app-elements' compiled CSS (app code is not scanned).
            <div className="flex items-center gap-2">
              <Text wrap="nowrap">
                {formatDate({
                  format: "full",
                  isoDate: resource.last_run_at,
                  timezone: user?.timezone,
                  locale: user?.locale,
                })}
              </Text>
              {subscriptionFailedOnLastRun(resource) && (
                <Badge variant="danger">Failed</Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "next_run",
        header: "Next run",
        kind: "datetime",
        sortBy: "next_run_at",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          resource.next_run_at == null ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">
              {formatDate({
                format: "full",
                isoDate: resource.next_run_at,
                timezone: user?.timezone,
                locale: user?.locale,
              })}
            </Text>
          ),
      },
      {
        id: "frequency",
        header: "Frequency",
        kind: "text",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => <Text wrap="nowrap">{resource.frequency}</Text>,
      },
      {
        id: "created",
        header: "Created",
        kind: "datetime",
        sortBy: "created_at",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatDate({
              format: "full",
              isoDate: resource.created_at,
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
