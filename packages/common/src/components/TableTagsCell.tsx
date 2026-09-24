import { Text, Tooltip } from "@commercelayer/app-elements"
import type { Tag } from "@commercelayer/sdk"
import type { FC } from "react"

/**
 * The tags of a table row, as a comma-separated line that ends in an ellipsis
 * when it does not fit. Plain text rather than badges: a badge cannot be cut, so
 * a few long tags would widen the column. Hovering the cell lists every tag.
 */
export const TableTagsCell: FC<{
  tags: Array<Pick<Tag, "id" | "name">> | null | undefined
}> = ({ tags }) => {
  if (tags == null || tags.length === 0) {
    return <Text variant="disabled">&#8212;</Text>
  }

  const names = tags.map((tag) => tag.name).join(", ")

  return (
    // The table truncates the direct children of a cell, and `Tooltip` renders
    // its box next to its label: without this wrapper the tooltip would be cut
    // at one line as well. Being fixed-positioned, it is not clipped by the
    // wrapper's own overflow.
    <div>
      <Tooltip
        // a block, so the line can be cut at the column edge
        className="block truncate"
        label={names}
        // the cell's `nowrap` is inherited: the list wraps again in the tooltip
        content={<span className="whitespace-normal">{names}</span>}
      />
    </div>
  )
}
