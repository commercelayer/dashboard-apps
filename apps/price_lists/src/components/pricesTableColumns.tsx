import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"

/**
 * Columns of the prices table.
 *
 * The SKU column carries the same information the list item used to show (image,
 * name and code); the row link is provided by the table itself, so no caret is
 * needed here.
 *
 * SKU is the primary column, always shown; the others can be hidden by the user
 * from the columns menu (`hideable`), with Reference hidden until it is turned
 * on.
 *
 * Requires `include: ['sku', 'price_list']` in the query.
 */
export function usePricesTableColumns(): Array<ResourceTableColumn<"prices">> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "SKU",
        cell: ({ resource }) => (
          <div className="flex items-center gap-4">
            <Avatar
              alt={resource.sku?.name ?? ""}
              src={resource.sku?.image_url as `https://${string}`}
              size="small"
            />
            <div className="min-w-0 [&>*]:truncate">
              <Text tag="div" weight="medium">
                {resource.sku?.name}
              </Text>
              <Text tag="div" weight="medium" size="x-small" variant="info">
                {resource.sku?.code}
              </Text>
            </div>
          </div>
        ),
      },
      {
        id: "price",
        header: "Price",
        hideable: true,
        // the number this table exists for: worth its place on a phone
        hideBelow: "never",
        kind: "amount",
        sortBy: "amount_cents",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.formatted_amount}</Text>
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
          // makes the price a discount. Struck through, as the price it replaces.
          if (
            resource.formatted_compare_at_amount == null ||
            resource.formatted_compare_at_amount === resource.formatted_amount
          ) {
            return <Text variant="disabled">&#8212;</Text>
          }
          return (
            <Text wrap="nowrap">
              <s>{resource.formatted_compare_at_amount}</s>
            </Text>
          )
        },
      },
      {
        id: "price_list",
        header: "Price list",
        hideable: true,
        kind: "text",
        cell: ({ resource }) =>
          resource.price_list?.name != null ? (
            <Text>{resource.price_list?.name}</Text>
          ) : (
            <Text variant="disabled">&#8212;</Text>
          ),
      },
      {
        id: "updated",
        header: "Updated",
        hideable: true,
        kind: "datetime",
        sortBy: "updated_at",
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
            <Text variant="disabled">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.reference}</Text>
          ),
      },
    ],
    [user?.timezone, user?.locale],
  )
}
