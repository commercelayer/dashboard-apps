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
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import type { OrderTab } from "#data/lists"

/**
 * Columns of the orders table, shared by the entry page and the filtered list.
 *
 * ORDER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Market, Country, Reference and
 * Tags hidden until they are turned on.
 *
 * @param sortBy - the metrics attribute of the "Order" sort option, which the
 * DATE column marks as sorted. Carts have no `placed_at`, so they go by
 * `order.created_at` instead.
 */
export function useOrdersTableColumns(
  // dotted as Metrics names are — the column type only accepts a Core sort field
  // or a namespaced metrics one
  sortBy: OrderTab["orderSortBy"],
): Array<ResourceTableColumn<"orders">> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Order",
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
            {/* mobile only: from `md` up the date has a column of its own */}
            <Text
              tag="div"
              size="x-small"
              variant="info"
              wrap="nowrap"
              className="md:hidden"
            >
              <OrderDate resource={resource} />
            </Text>
          </div>
        ),
      },
      {
        id: "date",
        header: "Date",
        kind: "datetime",
        hideable: true,
        // sorting is resolved server-side by the metrics API
        sortBy,
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            <OrderDate resource={resource} />
          </Text>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        kind: "text",
        hideable: true,
        // the email alone, the country having a column of its own. A guest
        // checkout can have no email, and the billing name stands in for it.
        cell: ({ resource }) => {
          const email = resource.customer?.email
          const label = isEmpty(email) ? getBillingName(resource) : email
          return <Text>{isEmpty(label) ? "-" : label}</Text>
        },
      },
      {
        id: "status",
        header: "Status",
        kind: "status",
        hideable: true,
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
      },
      {
        id: "amount",
        header: "Amount",
        kind: "amount",
        hideable: true,
        // what the row is worth: worth its place on a phone
        hideBelow: "never",
        // the amount alone: the payment status has a column of its own
        cell: ({ resource }) => (
          <Text weight="medium" wrap="nowrap">
            {getFormattedTotalAmount(resource)}
          </Text>
        ),
      },
      {
        id: "payment_status",
        header: "Payment status",
        kind: "status",
        hideable: true,
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {getOrderPaymentStatusName(resource.payment_status)}
          </Text>
        ),
      },
      {
        id: "market",
        header: "Market",
        kind: "text",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => <Text>{resource.market?.name ?? "-"}</Text>,
      },
      {
        id: "country",
        header: "Country",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => {
          const countryCode =
            resource.country_code ?? resource.billing_address?.country_code
          return <Text>{isEmpty(countryCode) ? "-" : countryCode}</Text>
        },
      },
      {
        id: "reference",
        header: "Reference",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => (
          <Text tag="div" wrap="nowrap">
            {isEmpty(resource.reference) ? "-" : resource.reference}
          </Text>
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
    [sortBy, user?.timezone, user?.locale],
  )
}

/**
 * When the order was placed, or last updated for a cart, which has no placement
 * date. Shared by the Date column and, on mobile where that column is hidden, the
 * name cell.
 */
function OrderDate({ resource }: { resource: Order }): React.JSX.Element {
  const { user } = useTokenProvider()
  return (
    <>
      {formatDate({
        format: "full",
        isoDate: resource.placed_at ?? resource.updated_at,
        timezone: user?.timezone,
        locale: user?.locale,
      })}
    </>
  )
}

/** Company name when present, otherwise the abbreviated billing full name. */
function getBillingName(order: Order): string {
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
