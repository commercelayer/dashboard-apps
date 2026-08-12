import type { FiltersInstructions } from "@commercelayer/app-elements"
import { listableStatuses } from "#data/lists"
import { getSubscriptionStatusName } from "./dictionaries"
import { frequenciesForFilters, getFrequencyLabelByValue } from "./frequencies"

export const instructions = (
  subscriptionModelFrequencies?: string[],
  options?: { hideFilterStatus?: boolean },
): FiltersInstructions => {
  const hideFilterStatus = options?.hideFilterStatus ?? false
  const frequenciesByModel = subscriptionModelFrequencies?.map((f) => {
    return {
      value: f,
      label: getFrequencyLabelByValue(f),
    }
  })
  const frequencies = frequenciesForFilters()

  return [
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
      hidden: hideFilterStatus,
      sdk: {
        predicate: "status_in",
        defaultOptions: [...listableStatuses],
      },
      render: {
        component: "inputToggleButton",
        props: {
          mode: "multi",
          options: listableStatuses.map((status) => ({
            value: status,
            // @ts-expect-error `pending` is supported by the API but not yet in the SDK status union (beta.9)
            label: getSubscriptionStatusName(status),
          })),
        },
      },
    },
    {
      label: "Frequency",
      type: "options",
      sdk: {
        predicate: "frequency_matches",
      },
      render: {
        component: "inputToggleButton",
        props: {
          mode: "single",
          options: frequenciesByModel ?? frequencies,
        },
      },
    },

    {
      label: "Search",
      type: "textSearch",
      sdk: {
        predicate: ["number", "customer_email"].join("_or_") + "_cont",
      },
      render: {
        component: "searchBar",
      },
    },
  ]
}
