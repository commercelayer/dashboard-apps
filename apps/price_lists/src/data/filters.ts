import type { FiltersInstructions } from "@commercelayer/app-elements"

/**
 * Filters of the prices list.
 *
 * The price list used to scope the page through the url (`/:priceListId/list`);
 * it is a regular filter now, so every price is reachable from a single list.
 */
export const filterInstructions: FiltersInstructions = [
  {
    label: "Price list",
    type: "options",
    sdk: {
      predicate: "price_list_id_in",
    },
    render: {
      component: "inputSelect",
      props: {
        resource: "price_lists",
        fieldForLabel: "name",
        fieldForValue: "id",
        // Core caps `page[size]` at 25, so searching server-side is what makes
        // price lists beyond the first page reachable
        searchBy: "name_cont",
        sortBy: { attribute: "name", direction: "asc" },
      },
    },
  },
  {
    label: "Search",
    type: "textSearch",
    sdk: {
      predicate:
        ["reference", "sku_code", "sku_name", "sku_reference"].join("_or_") +
        "_cont",
    },
    render: {
      component: "searchBar",
    },
  },
]
