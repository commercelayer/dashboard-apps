import type { Tag } from "@commercelayer/sdk"
import type { FC } from "react"
import { TableNamesCell } from "./TableNamesCell"

/** The tags of a table row, by name: see `TableNamesCell`. */
export const TableTagsCell: FC<{
  tags: Array<Pick<Tag, "id" | "name">> | null | undefined
}> = ({ tags }) => <TableNamesCell names={tags?.map((tag) => tag.name)} />
