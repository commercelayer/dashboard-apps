import {
  AvatarLetter,
  Badge,
  formatDate,
  RadialProgress,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Customer } from "@commercelayer/sdk"
import { useMemo } from "react"

/**
 * Placeholder for a value the customer does not have, rendered as a muted dash
 * so the column keeps its rhythm instead of looking broken.
 */
function EmptyValue(): React.JSX.Element {
  return <Text className="text-gray-300">&#8212;</Text>
}

/**
 * Avatar of a customer: initials for a registered one (the colour is derived
 * from the email, so it is stable), and the dashed pending circle for a guest,
 * who has no account to speak of.
 */
function CustomerAvatar({
  customer,
}: {
  customer: Customer
}): React.JSX.Element {
  return customer.has_password === true ? (
    <AvatarLetter text={customer.email} size="medium" />
  ) : (
    // no `percentage`, so it renders as the dashed circle
    <RadialProgress icon="user" size="medium" />
  )
}

/**
 * Columns of the customers table.
 *
 * Requires `include: ['customer_group']` in the query.
 */
export function useCustomersTableColumns(): Array<
  ResourceTableColumn<"customers">
> {
  const { user } = useTokenProvider()
  const { t } = useTranslation()

  return useMemo(
    () => [
      {
        header: "Customer",
        sortBy: "email",
        cell: ({ resource }) => (
          <div className="flex items-center gap-4">
            <CustomerAvatar customer={resource} />
            <div className="min-w-0">
              <Text tag="div" weight="medium">
                {resource.email}
              </Text>
              <Text tag="div" size="x-small" variant="info">
                {resource.has_password === true
                  ? t("apps.customers.details.registered")
                  : t("apps.customers.details.guest")}
              </Text>
            </div>
          </div>
        ),
      },
      {
        header: "Orders",
        sortBy: "total_orders_count",
        hideBelow: "md",
        cell: ({ resource }) =>
          resource.total_orders_count != null &&
          resource.total_orders_count > 0 ? (
            <Text wrap="nowrap">{resource.total_orders_count}</Text>
          ) : (
            <EmptyValue />
          ),
      },
      {
        header: "Group",
        hideBelow: "lg",
        cell: ({ resource }) =>
          resource.customer_group?.name != null ? (
            <Text>{resource.customer_group.name}</Text>
          ) : (
            <EmptyValue />
          ),
      },
      {
        header: "Status",
        sortBy: "status",
        cell: ({ resource }) => (
          // the raw status rather than `getCustomerStatusName`, as in the design.
          // A neutral badge because the dictionary maps all three statuses to the
          // same colour anyway.
          <Badge variant="secondary">{resource.status}</Badge>
        ),
      },
      {
        header: "Created",
        hideBelow: "md",
        sortBy: "created_at",
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
    ],
    [t, user?.timezone, user?.locale],
  )
}
