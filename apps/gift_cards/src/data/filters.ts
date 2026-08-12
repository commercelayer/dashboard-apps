import type { FiltersInstructions } from "@commercelayer/app-elements"

export const instructions: FiltersInstructions = [
  {
    label: "Markets",
    type: "options",
    sdk: {
      predicate: "market_id_in",
    },
    render: {
      component: "inputSelect",
      props: {
        fieldForLabel: "name",
        fieldForValue: "id",
        resource: "markets",
        searchBy: "name_cont",
        sortBy: { attribute: "name", direction: "asc" },
        hideWhenSingleItem: true,
        filters: {
          disabled_at_null: true,
        },
      },
    },
  },
  {
    label: "Status",
    type: "options",
    sdk: {
      predicate: "status_in",
      defaultOptions: ["inactive", "active", "redeemed"],
    },
    render: {
      component: "inputToggleButton",
      props: {
        mode: "multi",
        options: [
          { value: "draft", label: "Draft", isHidden: true },
          { value: "inactive", label: "Inactive" },
          { value: "active", label: "Active" },
          { value: "redeemed", label: "Redeemed" },
        ],
      },
    },
  },
  {
    label: "Search",
    type: "textSearch",
    sdk: {
      predicate: "gift_card_recipient_email_or_code_cont",
    },
    render: {
      component: "searchBar",
    },
  },
]
