import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"
import {
  getSubscriptionStatusBadgeVariant,
  getSubscriptionStatusName,
} from "#data/dictionaries"
import { subscriptionFailedOnLastRun } from "#utils/subscriptionFailedOnLastRun"

/**
 * Columns of the subscriptions table.
 *
 * Requires `include: ['customer', 'source_order', 'source_order.billing_address']`
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
        header: "Customer",
        kind: "text",
        cell: ({ resource }) => {
          const address = resource.source_order?.billing_address
          const name = address?.full_name ?? resource.customer_email
          if (name == null) {
            return <Text>-</Text>
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
        header: "Status",
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => (
          <Badge variant={getSubscriptionStatusBadgeVariant(resource.status)}>
            {getSubscriptionStatusName(resource.status)}
          </Badge>
        ),
      },
      {
        header: "Last run",
        kind: "datetime",
        // last column, left aligned: without this the table's leftover width
        // collects to its right. `w-px` cannot be honoured, so the column shrinks
        sortBy: "last_run_at",
        cell: ({ resource }) => {
          if (resource.last_run_at == null) {
            return <Text>-</Text>
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
    ],
    [user?.timezone, user?.locale],
  )
}
