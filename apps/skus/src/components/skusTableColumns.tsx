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
 * Columns of the SKUs table.
 *
 * The first column carries the same information the list item used to show
 * (image, name and code); the row link is provided by the table itself, so no
 * caret is needed here.
 *
 * SKU is the primary column, always shown; the others can be hidden by the user
 * from the columns menu (`hideable`), with Created, Reference and Tags hidden
 * until they are turned on.
 *
 * Requires `include: ['shipping_category', 'tags']` in the query.
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
        id: "shipping_category",
        header: "Shipping category",
        hideable: true,
        kind: "text",
        cell: ({ resource }) =>
          // requires `include: ['shipping_category']` in the query, otherwise
          // the relationship is not returned and this stays empty
          resource.shipping_category?.name != null ? (
            <Text>{resource.shipping_category?.name}</Text>
          ) : (
            <Text variant="disabled">&#8212;</Text>
          ),
      },
      {
        id: "updated",
        header: "Updated at",
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
        id: "created",
        header: "Created",
        kind: "datetime",
        sortBy: "created_at",
        hideable: true,
        defaultHidden: true,
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
