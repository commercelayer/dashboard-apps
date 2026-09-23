import { Badge, Tooltip } from "@commercelayer/app-elements"
import type { Tag } from "@commercelayer/sdk"
import type { FC } from "react"

/** How many tags are shown as badges before the rest collapse into "+N". */
const visibleTagsCount = 2

/**
 * The tags of a table row: the first two as badges, the rest counted in a "+N"
 * badge. Hovering the cell lists every tag, comma-separated, so the full set is
 * one gesture away without the column growing with each tag.
 */
export const TableTagsCell: FC<{
  tags: Array<Pick<Tag, "id" | "name">> | null | undefined
}> = ({ tags }) => {
  if (tags == null || tags.length === 0) {
    return <>-</>
  }

  const hiddenCount = tags.length - visibleTagsCount

  return (
    <Tooltip
      label={
        <span className="inline-flex items-center gap-1">
          {tags.slice(0, visibleTagsCount).map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="secondary">{`+${hiddenCount}`}</Badge>
          )}
        </span>
      }
      content={tags.map((tag) => tag.name).join(", ")}
    />
  )
}
