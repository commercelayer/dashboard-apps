import {
  Badge,
  type BadgeProps,
  type CurrencyCode,
  formatCentsToCurrency,
  formatDate,
  formatDisplayName,
  getOrderDisplayStatus,
  getOrderPaymentStatusName,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the orders table, shared by the entry page and the filtered list.
 *
 * @param sortBy - the metrics attribute the ORDER column sorts by. Carts have no
 * `placed_at`, so they are sorted by `order.updated_at` instead.
 */
export function useOrdersTableColumns(
  sortBy: string,
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
            <Text tag="div" weight="semibold" wrap="nowrap">
              {`${resource.market?.name ?? "Order"} #${resource.number ?? ""}`.trim()}
            </Text>
            <Text tag="div" size="small" variant="info" wrap="nowrap">
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
        hideBelow: "md",
        cell: ({ resource }) => {
          console.log("resource", resource)
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
                <Text tag="div" size="small" variant="info">
                  {email}
                </Text>
              )}
            </div>
          )
        },
      },
      {
        header: "Status",
        cell: ({ resource }) => {
          const displayStatus = getOrderDisplayStatus(resource)
          return (
            <Badge variant={toBadgeVariant(displayStatus.color)}>
              {displayStatus.label}
            </Badge>
          )
        },
      },
      {
        header: "Amount",
        align: "right",
        cell: ({ resource }) => (
          <div>
            <Text tag="div" weight="semibold" wrap="nowrap">
              {getFormattedTotalAmount(resource)}
            </Text>
            <Text
              tag="div"
              size="small"
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

/** Map the canonical order display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getOrderDisplayStatus>["color"],
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
