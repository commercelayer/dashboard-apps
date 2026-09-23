import type { TableSettingsConfig } from "@commercelayer/app-elements"

/**
 * Sort options and stored preference of the prices table.
 */
export const pricesTableSettings: TableSettingsConfig = {
  listId: "prices",
  sortOptions: [
    { id: "price", label: "Price", sortBy: "amount_cents", kind: "number" },
    { id: "updated", label: "Updated", sortBy: "updated_at", kind: "date" },
  ],
  defaultSort: { id: "updated", direction: "desc" },
}
