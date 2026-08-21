import type { FiltersInstructions } from "@commercelayer/app-elements"
import { t } from "@commercelayer/app-elements"
import type { Shipment } from "@commercelayer/sdk"
import { getShipmentStatusName } from "#data/dictionaries"

const allowedStatuses: Array<Shipment["status"]> = [
  "picking",
  "packing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "on_hold",
]

const textSearchPredicate = ["number", "reference"].join("_or_") + "_cont"

export const makeFiltersInstructions = (options?: {
  hideFilterStatus?: boolean
}): FiltersInstructions => {
  const hideFilterStatus = options?.hideFilterStatus ?? false
  return [
    {
      label: t("resources.stock_locations.name_other"),
      type: "options",
      sdk: {
        predicate: "stock_location_id_in",
      },
      render: {
        component: "inputSelect",
        props: {
          resource: "stock_locations",
          fieldForLabel: "name",
          fieldForValue: "id",
          searchBy: "name_cont",
          sortBy: { attribute: "updated_at", direction: "desc" },
          hideWhenSingleItem: true,
        },
      },
    },
    {
      label: "Archived",
      type: "options",
      // scoping only: the tabs decide whether archived shipments are included,
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
      label: t("apps.shipments.attributes.status"),
      type: "options",
      hidden: hideFilterStatus,
      sdk: {
        predicate: "status_in",
        defaultOptions: allowedStatuses,
      },
      render: {
        component: "inputSelect",
        props: {
          options: allowedStatuses.map((status) => ({
            value: status,
            label: getShipmentStatusName(status),
          })),
        },
      },
    },
    {
      label: t("common.time_range"),
      type: "timeRange",
      sdk: {
        predicate: "updated_at",
      },
      render: {
        component: "dateRangePicker",
      },
    },
    {
      label: t("resources.tags.name_other"),
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
      label: t("common.search"),
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
