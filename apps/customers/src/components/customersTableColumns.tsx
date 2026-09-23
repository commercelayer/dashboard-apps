import {
  AvatarLetter,
  Badge,
  formatDate,
  formatNumber,
  RadialProgress,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Customer } from "@commercelayer/sdk"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
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
 * CUSTOMER is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Updated, Reference and Tags
 * hidden until they are turned on.
 *
 * Requires `include: ['customer_group', 'tags']` in the query, and `reference`
 * among the sparse fields.
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
            <div className="min-w-0 [&>*]:truncate">
              <Text tag="div" weight="medium">
                {resource.email}
                {/* the Status column is hidden on mobile, so the badge rides with the name */}
                <Badge
                  variant="secondary"
                  className="md:hidden inline-block align-middle ml-2"
                >
                  {resource.status}
                </Badge>
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
        id: "orders",
        header: "Orders",
        kind: "count",
        hideable: true,
        sortBy: "total_orders_count",
        cell: ({ resource }) =>
          resource.total_orders_count != null &&
          resource.total_orders_count > 0 ? (
            <Text wrap="nowrap">
              {formatNumber({
                value: resource.total_orders_count,
                locale: user?.locale,
              })}
            </Text>
          ) : (
            <EmptyValue />
          ),
      },
      {
        id: "group",
        header: "Group",
        kind: "text",
        hideable: true,
        hideBelow: "lg",
        cell: ({ resource }) =>
          resource.customer_group?.name != null ? (
            <Text>{resource.customer_group.name}</Text>
          ) : (
            <EmptyValue />
          ),
      },
      {
        id: "status",
        header: "Status",
        kind: "status",
        sortBy: "status",
        hideable: true,
        cell: ({ resource }) => (
          // the raw status rather than `getCustomerStatusName`, as in the design.
          // A neutral badge because the dictionary maps all three statuses to the
          // same colour anyway.
          <Badge variant="secondary">{resource.status}</Badge>
        ),
      },
      {
        id: "created",
        header: "Created",
        kind: "datetime",
        sortBy: "created_at",
        hideable: true,
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
        id: "updated",
        header: "Updated",
        kind: "datetime",
        sortBy: "updated_at",
        hideable: true,
        defaultHidden: true,
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
            <EmptyValue />
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
        cell: ({ resource }) =>
          (resource.tags?.length ?? 0) > 0 ? (
            <TableTagsCell tags={resource.tags} />
          ) : (
            <EmptyValue />
          ),
      },
    ],
    [t, user?.timezone, user?.locale],
  )
}
