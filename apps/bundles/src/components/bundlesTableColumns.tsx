import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the bundles table.
 *
 * The first column carries the same information the list item used to show
 * (image, name and code); the row link is provided by the table itself, so no
 * caret is needed here.
 *
 * BUNDLE is the primary column, always shown; the others can be hidden by the
 * user from the columns menu (`hideable`), with Reference and Tags hidden until
 * they are turned on.
 *
 * Requires `include: ['market', 'tags']` in the query, and `reference` among the
 * sparse fields.
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
            <div className="min-w-0 [&>*]:truncate">
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
        id: "price",
        header: "Price",
        hideable: true,
        // what the row costs: worth its place on a phone, as in price_lists
        hideBelow: "never",
        kind: "amount",
        sortBy: "price_amount_cents",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.formatted_price_amount}</Text>
        ),
      },
      {
        id: "original",
        header: "Original",
        hideable: true,
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
        id: "market",
        header: "Market",
        hideable: true,
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
        id: "created",
        header: "Created",
        hideable: true,
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
      {
        id: "reference",
        header: "Reference",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          isEmpty(resource.reference) ? (
            <Text className="text-gray-300">&#8212;</Text>
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
