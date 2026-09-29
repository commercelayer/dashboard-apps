import type { TableSettingsConfig } from "@commercelayer/app-elements"

/**
 * Sort options and stored preference of the SKUs table.
 */
export const skusTableSettings: TableSettingsConfig = {
  listId: "skus",
  sortOptions: [
    { id: "code", label: "Code", sortBy: "code", kind: "text" },
    { id: "name", label: "Name", sortBy: "name", kind: "text" },
    { id: "updated", label: "Updated", sortBy: "updated_at", kind: "date" },
  ],
  defaultSort: { id: "code", direction: "asc" },
}
