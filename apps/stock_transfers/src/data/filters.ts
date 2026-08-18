import type { FiltersInstructions } from "@commercelayer/app-elements"
import { getStockTransferStatusName } from "@commercelayer/app-elements"
import { listableStatuses } from "#data/lists"

const textSearchPredicate =
  [
    "number",
    "reference",
    "sku_code",
    "origin_stock_location_name",
    "destination_stock_location_name",
  ].join("_or_") + "_cont"

/** Shared props of the two stock location fields, which differ only by predicate. */
const stockLocationSelect = {
  component: "inputSelect" as const,
  props: {
    resource: "stock_locations" as const,
    fieldForLabel: "name",
    fieldForValue: "id",
    searchBy: "name_cont",
    sortBy: { attribute: "name", direction: "asc" as const },
    filters: {
      disabled_at_null: true,
    },
  },
}

export const makeFiltersInstructions = (options?: {
  hideFilterStatus?: boolean
}): FiltersInstructions => {
  const hideFilterStatus = options?.hideFilterStatus ?? false
  return [
    {
      label: "Origin",
      type: "options",
      sdk: {
        predicate: "origin_stock_location_id_in",
      },
      render: stockLocationSelect,
    },
    {
      label: "Destination",
      type: "options",
      sdk: {
        predicate: "destination_stock_location_id_in",
      },
      render: stockLocationSelect,
    },
    {
      label: "Archived",
      type: "options",
      // scoping only: the tabs decide whether archived transfers are included,
      // it is never rendered as a field
      hidden: true,
      sdk: {
        predicate: "archived_at_null",
        parseFormValue: (value) =>
          value === "show" ? undefined : value === "hide",
      },
      render: {
        component: "inputSelect",
        props: {
          isMulti: false,
          options: [
            { value: "only", label: "Only archived" },
            { value: "hide", label: "Hide archived" },
            { value: "show", label: "Show all, both archived and not" },
          ],
        },
      },
    },
    {
      label: "Status",
      type: "options",
      hidden: hideFilterStatus,
      sdk: {
        predicate: "status_in",
        defaultOptions: listableStatuses,
      },
      render: {
        component: "inputSelect",
        props: {
          options: listableStatuses.map((status) => ({
            value: status,
            label: getStockTransferStatusName(status),
          })),
        },
      },
    },
    {
      label: "Time Range",
      type: "timeRange",
      sdk: {
        predicate: "updated_at",
      },
      render: {
        component: "dateRangePicker",
      },
    },
    {
      label: "Search",
      type: "textSearch",
      sdk: {
        predicate: textSearchPredicate,
      },
      render: {
        component: "searchBar",
      },
    },
  ]
}
