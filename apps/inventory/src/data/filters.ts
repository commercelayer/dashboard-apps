import type { FiltersInstructions } from "@commercelayer/app-elements"

/**
 * Filters of the stock items list.
 *
 * The stock location used to scope the page through the url
 * (`/:stockLocationId/list`); it is a regular filter now, so every stock item is
 * reachable from a single list.
 */
export const stockItemsInstructions: FiltersInstructions = [
  {
    label: "Stock locations",
    type: "options",
    sdk: {
      predicate: "stock_location_id_in",
    },
    render: {
      component: "inputSelect",
      // the axis this page is read through, so it sits in the bar rather than
      // behind the funnel: single-valued, and it states itself instead of
      // leaving a pill underneath
      position: "bar",
      props: {
        isMulti: false,
        placeholder: "All locations",
        resource: "stock_locations",
        fieldForLabel: "name",
        fieldForValue: "id",
        // Core caps `page[size]` at 25, so searching server-side is what makes
        // stock locations beyond the first page reachable
        searchBy: "name_i_cont",
        sortBy: { attribute: "name", direction: "asc" },
      },
    },
  },
  {
    label: "Availability",
    type: "groupedPredicates",
    urlParamKey: "availability",
    render: {
      component: "inputToggleButton",
      props: {
        mode: "single",
        options: [
          {
            value: "in_stock",
            label: "In stock",
            sdk: { predicate: "quantity_gt", value: "0" },
          },
          {
            value: "out_of_stock",
            label: "Out of stock",
            sdk: { predicate: "quantity_eq", value: "0" },
          },
        ],
      },
    },
  },
  {
    label: "Search",
    type: "textSearch",
    sdk: {
      predicate: ["sku_code", "sku_name"].join("_or_") + "_i_cont",
    },
    render: {
      component: "searchBar",
    },
  },
]
