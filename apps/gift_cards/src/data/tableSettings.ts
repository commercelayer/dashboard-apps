import type { TableSettingsConfig } from "@commercelayer/app-elements"

/**
 * Sort options and stored preference of the gift cards table.
 */
export const giftCardsTableSettings: TableSettingsConfig = {
  listId: "gift_cards",
  sortOptions: [
    {
      id: "balance",
      label: "Balance",
      sortBy: "balance_cents",
      kind: "number",
    },
    { id: "expires", label: "Expires", sortBy: "expires_at", kind: "date" },
    { id: "created", label: "Created", sortBy: "created_at", kind: "date" },
  ],
  defaultSort: { id: "created", direction: "desc" },
}
