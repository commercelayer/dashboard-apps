import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the bundles table.
 *
 * The first column carries the same information the list item used to show
 * (image, name and code); the row link is provided by the table itself, so no
 * caret is needed here.
 *
 * Requires `include: ['market']` in the query.
 */
export function useBundlesTableColumns(): Array<
  ResourceTableColumn<"bundles">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Bundle",
        sortBy: "name",
        cell: ({ resource }) => (
          <div className="flex items-center gap-4">
            <Avatar
              alt={resource.name}
              src={resource.image_url as `https://${string}`}
              size="small"
            />
            <div>
              <Text tag="div" weight="medium">
                {resource.name}
              </Text>
              <Text tag="div" weight="medium" size="x-small" variant="info">
                {resource.code}
              </Text>
            </div>
          </div>
        ),
      },
      {
        header: "Price",
        kind: "amount",
        sortBy: "price_amount_cents",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.formatted_price_amount}</Text>
        ),
      },
      {
        header: "Original",
        kind: "amount",
        sortBy: "compare_at_amount_cents",
        cell: ({ resource }) => {
          // a compare-at amount only says something when it differs: that is what
          // makes the bundle a saving. Struck through, as the price it replaces.
          if (
            resource.formatted_compare_at_amount == null ||
            resource.formatted_compare_at_amount ===
              resource.formatted_price_amount
          ) {
            return <Text className="text-gray-300">&#8212;</Text>
          }
          return (
            <Text wrap="nowrap">
              <s>{resource.formatted_compare_at_amount}</s>
            </Text>
          )
        },
      },
      {
        header: "Market",
        kind: "text",
        cell: ({ resource }) => (
          <Text>
            {/* a bundle without a market applies to every market sharing its currency */}
            {resource.market?.name ??
              `All markets in ${resource.currency_code ?? "-"}`}
          </Text>
        ),
      },
      {
        header: "Created",
        kind: "datetime",
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
