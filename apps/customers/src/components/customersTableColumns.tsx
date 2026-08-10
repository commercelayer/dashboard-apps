import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

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
        cell: ({ resource }) => <Text weight="semibold">{resource.email}</Text>,
      },
      {
        header: "Type",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Badge variant="secondary">
            {resource.has_password === true
              ? t("apps.customers.details.registered")
              : t("apps.customers.details.guest")}
          </Badge>
        ),
      },
      {
        header: "Orders",
        align: "right",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.total_orders_count ?? 0}</Text>
        ),
      },
      {
        header: "Group",
        hideBelow: "lg",
        cell: ({ resource }) => (
          <Text variant="info">{resource.customer_group?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Created",
        align: "right",
        hideBelow: "md",
        sortBy: "created_at",
        cell: ({ resource }) => (
          <Text variant="info" wrap="nowrap">
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
