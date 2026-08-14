import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"

/**
 * Columns of the SKU lists table.
 *
 * `Type` is derived from the `manual` flag: a manual list holds hand-picked SKUs,
 * while an automatic one resolves them from a code regex.
 */
export function useSkuListsTableColumns(): Array<
  ResourceTableColumn<"sku_lists">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Name",
        sortBy: "name",
        cell: ({ resource }) => <Text weight="medium">{resource.name}</Text>,
      },
      {
        header: "Type",
        sortBy: "manual",
        hideBelow: "md",
        cell: ({ resource }) => (
          <Badge variant="secondary">
            {resource.manual === true ? "Manual" : "Automatic"}
          </Badge>
        ),
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
