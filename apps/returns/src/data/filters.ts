import type { FiltersInstructions } from "@commercelayer/app-elements"
import { getReturnStatusName, t } from "@commercelayer/app-elements"
import { listableStatuses } from "#data/lists"

const textSearchPredicate =
  [
    "number",
    "reference",
    "customer_email",
    "origin_address_email",
    "origin_address_company",
    "origin_address_first_name",
    "origin_address_last_name",
    "origin_address_billing_info",
    "destination_address_email",
    "destination_address_company",
    "destination_address_first_name",
    "destination_address_last_name",
    "destination_address_billing_info",
  ].join("_or_") + "_cont"

export const makeFiltersInstructions = (options?: {
  hideFilterStatus?: boolean
}): FiltersInstructions => {
  const hideFilterStatus = options?.hideFilterStatus ?? false
  return [
    {
      label: t("apps.returns.details.return_locations"),
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
          searchBy: "name_i_cont",
          sortBy: { attribute: "name", direction: "asc" },
          hideWhenSingleItem: true,
          filters: {
            disabled_at_null: true,
          },
        },
      },
    },
    {
      label: "Archived",
      type: "options",
      // scoping only: the tabs decide whether archived returns are included,
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
      label: t("apps.returns.attributes.status"),
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
            label: getReturnStatusName(status),
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
