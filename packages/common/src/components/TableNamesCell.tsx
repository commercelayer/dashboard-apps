import { Text, Tooltip } from "@commercelayer/app-elements"
import type { FC } from "react"

/**
 * A list of names in a table cell — tags, stock locations — as the first name
 * and how many more there are ("EU Warehouse + 2"). Hovering lists them all,
 * comma-separated, when there is more than one; a single name has nothing more
 * to show. A long first name ends in an ellipsis at the column edge, while the
 * count always stays in view. Repeated names are shown once.
 */
export const TableNamesCell: FC<{
  names: Array<string | null | undefined> | null | undefined
}> = ({ names }) => {
  const unique = [
    ...new Set(
      (names ?? []).filter(
        (name): name is string => name != null && name !== "",
      ),
    ),
  ]
  const [first, ...others] = unique

  if (first == null) {
    return <Text variant="disabled">&#8212;</Text>
  }

  const line = (
    <span className="flex min-w-0">
      <span className="min-w-0 truncate">{first}</span>
      {others.length > 0 && (
        <span className="shrink-0 whitespace-pre">{` + ${others.length}`}</span>
      )}
    </span>
  )

  return (
    // The table truncates the direct children of a cell, and `Tooltip` renders
    // its box next to its label: without this wrapper the tooltip would be cut
    // at one line as well. Being fixed-positioned, it is not clipped by the
    // wrapper's own overflow.
    <div>
      {others.length > 0 ? (
        <Tooltip
          className="block"
          label={line}
          // the cell's `nowrap` is inherited: the list wraps again in the tooltip
          content={
            <span className="whitespace-normal">{unique.join(", ")}</span>
          }
        />
      ) : (
        line
      )}
    </div>
  )
}
