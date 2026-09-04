import {
  type CurrencyCode,
  formatCentsToCurrency,
  formatDate,
  formatDisplayName,
  getOrderDisplayStatus,
  getOrderPaymentStatusName,
  ResourceStatusBadge,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import type { OrderTab } from "#data/lists"

/**
 * Columns of the orders table, shared by the entry page and the filtered list.
 *
 * @param sortBy - the metrics attribute the ORDER column sorts by. Carts have no
 * `placed_at`, so they are sorted by `order.updated_at` instead.
 */
export function useOrdersTableColumns(
  // the metrics attribute the tab sorts by, dotted as Metrics names are — the
  // column type only accepts a Core sort field or a namespaced metrics one
  sortBy: OrderTab["sortBy"],
): Array<ResourceTableColumn<"orders">> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Order",
        // sorting is resolved server-side by the metrics API
        sortBy,
        cell: ({ resource }) => (
          <div>
            <Text tag="div" weight="medium" wrap="nowrap">
              {`${resource.market?.name ?? "Order"} #${resource.number ?? ""}`.trim()}
              {/* the Status column is hidden on mobile, so the badge rides with the name */}
              <RowStatusBadge
                resource={resource}
                className="md:hidden inline-block align-middle ml-2"
              />
            </Text>
            <Text tag="div" size="x-small" variant="info" wrap="nowrap">
              {formatDate({
                format: "full",
                isoDate: resource.placed_at ?? resource.updated_at,
                timezone: user?.timezone,
                locale: user?.locale,
              })}
            </Text>
          </div>
        ),
      },
      {
        header: "Customer",
        kind: "text",
        cell: ({ resource }) => {
          const name = getCustomerName(resource)
          const countryCode = resource.billing_address?.country_code
          const email = resource.customer?.email
          // guest checkouts can have no billing name at all, in which case the
          // email is the only identifying information worth showing first
          const title = isEmpty(name) ? email : name

          return (
            <div>
              <Text tag="div" weight="medium">
                {isEmpty(title) ? "-" : title}
                {!isEmpty(countryCode) ? ` (${countryCode})` : ""}
              </Text>
              {!isEmpty(email) && title !== email && (
                <Text tag="div" size="x-small" variant="info">
                  {email}
                </Text>
              )}
            </div>
          )
        },
      },
      {
        header: "Status",
        kind: "status",
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
      },
      {
        header: "Amount",
        kind: "amount",
        // what the row is worth: worth its place on a phone
        hideBelow: "never",
        cell: ({ resource }) => (
          <div>
            <Text tag="div" weight="medium" wrap="nowrap">
              {getFormattedTotalAmount(resource)}
            </Text>
            <Text
              tag="div"
              size="x-small"
              weight="medium"
              variant="info"
              wrap="nowrap"
            >
              {getOrderPaymentStatusName(resource.payment_status)}
            </Text>
          </div>
        ),
      },
    ],
    [sortBy, user?.timezone, user?.locale],
  )
}

/** Company name when present, otherwise the abbreviated billing full name. */
function getCustomerName(order: Order): string {
  const billingAddress = order.billing_address
  return !isEmpty(billingAddress?.company)
    ? (billingAddress?.company ?? "")
    : formatDisplayName(
        billingAddress?.first_name ?? "",
        billingAddress?.last_name ?? "",
      )
}

/**
 * This helper aims to get `formatted_total_amount` from a metrics `Order`,
 * which returns `total_amount` in units instead of a formatted string.
 */
function getFormattedTotalAmount(order: Order): string | null | undefined {
  if ("total_amount" in order && order.currency_code != null) {
    return formatCentsToCurrency(
      (order.total_amount as number) * 100,
      order.currency_code as CurrencyCode,
    )
  }

  return order.formatted_total_amount
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
  resource: Order
  className?: string
}): React.JSX.Element {
  const displayStatus = getOrderDisplayStatus(resource)
  return <ResourceStatusBadge status={displayStatus} className={className} />
}
