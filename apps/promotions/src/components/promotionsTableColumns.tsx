import {
  Badge,
  type BadgeProps,
  formatDate,
  getPromotionDisplayStatus,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the promotions table.
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
          <div className="flex items-center gap-2">
            <Text weight="medium">{resource.name}</Text>
            {resource.type === "flex_promotions" && (
              <Badge variant="teal">flex</Badge>
            )}
          </div>
        ),
      },
      {
        header: "Coupons",
        hideBelow: "md",
        cell: ({ resource }) => {
          // `coupons_count` exists on every promotion type except flex ones, and
          // is absent from the list's sparse-fields union, hence the narrowing
          const couponsCount =
            "coupons_count" in resource ? resource.coupons_count : undefined
          return couponsCount == null ? (
            <Text className="text-gray-300">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{couponsCount}</Text>
          )
        },
      },
      {
        header: "Priority",
        hideBelow: "md",
        sortBy: "priority",
        cell: ({ resource }) =>
          resource.priority == null ? (
            <Text className="text-gray-300">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.priority}</Text>
          ),
      },
      {
        header: "Status",
        cell: ({ resource }) => {
          const displayStatus = getPromotionDisplayStatus(resource)
          return (
            <Badge variant={toBadgeVariant(displayStatus.color)}>
              {displayStatus.label}
            </Badge>
          )
        },
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
    [user?.timezone, user?.locale],
  )
}

/** Map the canonical promotion display status color onto a `Badge` variant. */
function toBadgeVariant(
  color: ReturnType<typeof getPromotionDisplayStatus>["color"],
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
