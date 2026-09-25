import {
  formatDate,
  formatDateRange,
  formatDateWithPredicate,
  formatNumber,
  getPromotionDisplayStatus,
  ResourceStatusBadge,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Promotion } from "@commercelayer/sdk"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the promotions table.
 *
 * NAME is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Priority, Usage, Reference and
 * Tags hidden until they are turned on. Tags need `include: ['tags']` in the query. The
 * availability dates under the name are for mobile, where Starts and Expires
 * are not on screen.
 *
 * The status is derived from the promotion's dates and `disabled_at` rather than
 * read from an attribute, so those fields have to be in the query.
 */
export function usePromotionsTableColumns(): Array<
  ResourceTableColumn<"promotions">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Name",
        sortBy: "name",
        cell: ({ resource }) => (
          <div>
            <div className="flex items-center gap-2">
              <Text weight="medium">{resource.name}</Text>
              {/* the Status column is hidden on mobile, so the badge rides with the name */}
              <RowStatusBadge resource={resource} className="md:hidden" />
            </div>
            {/* mobile only: from `md` up Starts and Expires have columns of
                their own */}
            <Text
              tag="div"
              size="x-small"
              variant="info"
              wrap="nowrap"
              className="md:hidden"
            >
              {/* when the promotion is available, as the list rows used to show it:
                  the same `formatDateRange` that `ResourceListItem` uses for its
                  promotions description */}
              {resource.expires_at == null
                ? formatDateWithPredicate({
                    predicate: "From",
                    isoDate: resource.starts_at,
                    timezone: user?.timezone,
                    format: "date",
                  })
                : formatDateRange({
                    rangeFrom: resource.starts_at,
                    rangeTo: resource.expires_at,
                    timezone: user?.timezone,
                    locale: user?.locale,
                  })}
            </Text>
          </div>
        ),
      },
      {
        id: "starts",
        header: "Starts",
        kind: "datetime",
        sortBy: "starts_at",
        hideable: true,
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatDate({
              format: "date",
              isoDate: resource.starts_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
      {
        id: "expires",
        header: "Expires",
        kind: "datetime",
        sortBy: "expires_at",
        hideable: true,
        cell: ({ resource }) =>
          resource.expires_at == null ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">
              {formatDate({
                format: "date",
                isoDate: resource.expires_at,
                timezone: user?.timezone,
                locale: user?.locale,
              })}
            </Text>
          ),
      },
      {
        id: "coupons",
        header: "Coupons",
        kind: "count",
        hideable: true,
        cell: ({ resource }) => {
          // `coupons_count` exists on every promotion type except flex ones, and
          // is absent from the list's sparse-fields union, hence the narrowing
          const couponsCount =
            "coupons_count" in resource ? resource.coupons_count : undefined
          return couponsCount == null ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">
              {formatNumber({ value: couponsCount, locale: user?.locale })}
            </Text>
          )
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
        id: "priority",
        header: "Priority",
        kind: "count",
        sortBy: "priority",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          resource.priority == null ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.priority}</Text>
          ),
      },
      {
        id: "usage",
        header: "Usage",
        kind: "count",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          resource.total_usage_count == null ? (
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">
              {formatNumber({
                value: resource.total_usage_count,
                locale: user?.locale,
              })}
              {/* against the limit, when there is one */}
              {resource.total_usage_limit != null &&
                ` / ${formatNumber({
                  value: resource.total_usage_limit,
                  locale: user?.locale,
                })}`}
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
  resource: Promotion
  className?: string
}): React.JSX.Element {
  const displayStatus = getPromotionDisplayStatus(resource)
  return <ResourceStatusBadge status={displayStatus} className={className} />
}
