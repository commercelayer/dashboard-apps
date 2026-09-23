import type { TableSettingsConfig } from "@commercelayer/app-elements"

/**
 * Sort options and stored preference of the bundles table.
 */
export const bundlesTableSettings: TableSettingsConfig = {
  listId: "bundles",
  sortOptions: [
    { id: "name", label: "Name", sortBy: "name", kind: "text" },
    {
      id: "price",
      label: "Price",
      sortBy: "price_amount_cents",
      kind: "number",
    },
    { id: "created", label: "Created", sortBy: "created_at", kind: "date" },
  ],
  defaultSort: { id: "name", direction: "asc" },
}
