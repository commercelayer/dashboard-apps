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
      // the axis this page is read through, so it sits in the bar rather than
      // behind the funnel: single-valued, and it states itself instead of
      // leaving a pill underneath
      position: "bar",
      props: {
        isMulti: false,
        placeholder: "All price lists",
        resource: "price_lists",
        fieldForLabel: "name",
        fieldForValue: "id",
        // Core caps `page[size]` at 25, so searching server-side is what makes
        // price lists beyond the first page reachable
        searchBy: "name_i_cont",
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
