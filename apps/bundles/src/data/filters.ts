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
    label: "Tags",
    type: "options",
    sdk: {
      predicate: "tags_id_in",
    },
    render: {
      component: "inputSelect",
      props: {
        fieldForLabel: "name",
        fieldForValue: "id",
        resource: "tags",
        searchBy: "name_cont",
        sortBy: { attribute: "name", direction: "asc" },
      },
    },
  },

  {
    label: "Search",
    type: "textSearch",
    sdk: {
      predicate: ["code", "name", "description"].join("_or_") + "_cont",
    },
    render: {
      component: "searchBar",
    },
  },
]
