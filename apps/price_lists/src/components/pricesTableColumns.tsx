import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the prices table.
 *
 * The SKU column carries the same information the list item used to show (image,
 * name and code); the row link is provided by the table itself, so no caret is
 * needed here.
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
            <div>
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
        header: "Price",
        cell: ({ resource }) => (
          <div>
            <Text tag="div" wrap="nowrap">
              {resource.formatted_amount}
            </Text>
            {resource.formatted_compare_at_amount !==
              resource.formatted_amount && (
              // a compare-at amount that differs is what makes the price a
              // discount, so it stays visible, struck through
              // and smaller, under the price actually charged
              <Text tag="div" size="x-small" variant="info" wrap="nowrap">
                <s>{resource.formatted_compare_at_amount}</s>
              </Text>
            )}
          </div>
        ),
      },
      {
        header: "Price list",
        hideBelow: "md",
        cell: ({ resource }) => <Text>{resource.price_list?.name ?? "-"}</Text>,
      },
      {
        header: "Updated at",
        hideBelow: "md",
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
    ],
    [user?.timezone, user?.locale],
  )
}
