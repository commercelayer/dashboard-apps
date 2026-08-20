import {
  Avatar,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the SKUs table.
 *
 * The first column carries the same information the list item used to show
 * (image, name and code); the row link is provided by the table itself, so no
 * caret is needed here.
 */
export function useSkusTableColumns(): Array<ResourceTableColumn<"skus">> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "SKU",
        sortBy: "code",
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
        header: "Shipping category",
        kind: "text",
        cell: ({ resource }) => (
          // requires `include: ['shipping_category']` in the query, otherwise
          // the relationship is not returned and this stays empty
          <Text>{resource.shipping_category?.name ?? "-"}</Text>
        ),
      },
      {
        header: "Updated at",
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
    ],
    [user?.timezone, user?.locale],
  )
}
