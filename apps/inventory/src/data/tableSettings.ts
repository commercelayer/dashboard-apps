import type { TableSettingsConfig } from "@commercelayer/app-elements"

/**
 * Sort options and stored preference of the stock items table.
 */
export const stockItemsTableSettings: TableSettingsConfig = {
  listId: "stock_items",
  sortOptions: [
    { id: "quantity", label: "Quantity", sortBy: "quantity", kind: "number" },
    { id: "updated", label: "Updated", sortBy: "updated_at", kind: "date" },
  ],
  defaultSort: { id: "updated", direction: "desc" },
}
