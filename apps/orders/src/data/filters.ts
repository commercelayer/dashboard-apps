import { type FiltersInstructions, t } from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"

export type CountryCodesFilterOptions = Array<{ label: string; value: string }>

/** Filters a tab can take over, so the drawer stops offering them. */
export type HideableFilter = "status_in" | "fulfillment_statuses_in"

export const makeInstructions = ({
  sortByAttribute = "placed_at",
  countryCodes,
  hiddenFilters = [],
}: {
  sortByAttribute?: "placed_at" | "created_at"
  countryCodes?: CountryCodesFilterOptions
  /**
   * Filters to keep out of the drawer, because the active tab already pins them:
   * the Placed tab decides the status, so a status field there would only invite
   * the user to contradict the tab they are on.
   *
   * They are hidden, not removed — a hidden instruction still turns its value into
   * the query (and produces no pill), which is what the tab needs.
   */
  hiddenFilters?: HideableFilter[]
}): FiltersInstructions => [
  {
    label: t("apps.orders.attributes.status"),
    hidden: hiddenFilters.includes("status_in"),
    type: "options",
    sdk: {
      predicate: "status_in",
      defaultOptions: ["placed", "approved", "cancelled", "editing"],
    },
    render: {
      component: "inputSelect",
      props: {
        options: [
          {
            value: "pending",
            label: t("resources.orders.attributes.status.pending"),
            isHidden: true,
          },
          {
            value: "placed",
            label: t("resources.orders.attributes.status.placed"),
          },
          {
            value: "approved",
            label: t("resources.orders.attributes.status.approved"),
          },
          {
            value: "cancelled",
            label: t("resources.orders.attributes.status.cancelled"),
          },
          {
            value: "editing",
            label: t("resources.orders.attributes.status.editing"),
          },
        ],
      },
    },
  },
  {
    label: t("apps.orders.attributes.payment_status"),
    type: "options",
    sdk: {
      predicate: "payment_status_in",
    },
    render: {
      component: "inputSelect",
      props: {
        options: [
          {
            value: "authorized",
            label: t("resources.orders.attributes.payment_status.authorized"),
          },
          {
            value: "paid",
            label: t("resources.orders.attributes.payment_status.paid"),
          },
          {
            value: "voided",
            label: t("resources.orders.attributes.payment_status.voided"),
          },
          {
            value: "refunded",
            label: t("resources.orders.attributes.payment_status.refunded"),
          },
          {
            value: "partially_authorized",
            label: t(
              "resources.orders.attributes.payment_status.partially_authorized",
            ),
          },
          {
            value: "partially_refunded",
            label: t(
              "resources.orders.attributes.payment_status.partially_refunded",
            ),
          },
          {
            value: "free",
            label: t("resources.orders.attributes.payment_status.free"),
          },
          {
            value: "unpaid",
            label: t("resources.orders.attributes.payment_status.unpaid"),
          },
        ],
      },
    },
  },
  {
    label: t("apps.orders.attributes.fulfillment_status"),
    hidden: hiddenFilters.includes("fulfillment_statuses_in"),
    type: "options",
    sdk: {
      // plural: the metrics API's field is `fulfillment_statuses`, and it
      // rejects the singular
      predicate: "fulfillment_statuses_in",
    },
    render: {
      component: "inputSelect",
      props: {
        options: [
          {
            value: "unfulfilled",
            label: t(
              "resources.orders.attributes.fulfillment_status.unfulfilled",
            ),
          },
          {
            value: "in_progress",
            label: t(
              "resources.orders.attributes.fulfillment_status.in_progress",
            ),
          },
          {
            value: "fulfilled",
            label: t(
              "resources.orders.attributes.fulfillment_status.fulfilled",
            ),
          },
          // no `not_required`: the metrics API knows only `unfulfilled`,
          // `in_progress` and `fulfilled`, and rejects the request outright when
          // asked for it
        ],
      },
    },
  },
  {
    label: t("resources.markets.name_other"),
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
    label: "Countries",
    type: "options",
    hidden: countryCodes == null || countryCodes.length === 0,
    sdk: {
      predicate: "country_codes_in",
    },
    render: {
      component: "inputSelect",
      props: {
        options: countryCodes ?? [],
      },
    },
  },
  {
    label: t("apps.orders.tasks.archived"),
    type: "options",
    sdk: {
      predicate: "archived",
      parseFormValue: (value) =>
        value === "show" ? undefined : value === "only",
    },
    hidden: true,
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
    label: t("common.time_range"),
    type: "timeRange",
    sdk: {
      predicate: sortByAttribute,
    },
    render: {
      component: "dateRangePicker",
    },
  },
  {
    label: t("common.amount"),
    type: "currencyRange",
    sdk: {
      predicate: "total_amount_cents",
    },
    render: {
      component: "inputCurrencyRange",
      props: {
        label: t("common.amount"),
      },
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
      predicate: "aggregated_details",
      parseFormValue: parseTextSearchValue,
    },
    render: {
      component: "searchBar",
    },
  },
]

export const makeCartsInstructions = (): FiltersInstructions => [
  {
    label: t("apps.orders.attributes.status"),
    type: "options",
    sdk: {
      predicate: "status_in",
      defaultOptions: ["pending"],
    },
    render: {
      component: "inputSelect",
      props: {
        options: [{ value: "pending", label: "Pending", isHidden: true }],
      },
    },
    hidden: true,
  },
  {
    label: t("apps.orders.attributes.payment_status"),
    type: "options",
    sdk: {
      predicate: "payment_status_in",
    },
    render: {
      component: "inputSelect",
      props: {
        options: [
          {
            value: "authorized",
            label: t("resources.orders.attributes.payment_status.authorized"),
          },
          {
            value: "paid",
            label: t("resources.orders.attributes.payment_status.paid"),
          },
          {
            value: "voided",
            label: t("resources.orders.attributes.payment_status.voided"),
          },
          {
            value: "refunded",
            label: t("resources.orders.attributes.payment_status.refunded"),
          },
          {
            value: "partially_authorized",
            label: t(
              "resources.orders.attributes.payment_status.partially_authorized",
            ),
          },
          {
            value: "partially_refunded",
            label: t(
              "resources.orders.attributes.payment_status.partially_refunded",
            ),
          },
          {
            value: "free",
            label: t("resources.orders.attributes.payment_status.free"),
          },
          {
            value: "unpaid",
            label: t("resources.orders.attributes.payment_status.unpaid"),
          },
        ],
      },
    },
  },
  {
    label: t("common.amount"),
    type: "currencyRange",
    sdk: {
      predicate: "total_amount_cents",
    },
    render: {
      component: "inputCurrencyRange",
      props: {
        label: t("common.amount"),
      },
    },
  },
  {
    label: t("common.search"),
    type: "textSearch",
    sdk: {
      predicate: "aggregated_details",
      parseFormValue: parseTextSearchValue,
    },
    render: {
      component: "searchBar",
    },
  },
]

export function parseTextSearchValue(value: unknown): string | undefined {
  if (typeof value !== "string" || value == null || isEmpty(value.trim())) {
    return undefined
  }
  const searchText = value.trim()

  if (searchText.includes("*") || searchText.includes('"')) {
    return searchText
  }

  // It's not a full or partial email, but text contains a dot, needs to wrap it in double quotes so API won't escape the dot
  if (searchText.includes(".") && !searchText.includes("@")) {
    return `"${searchText}"*`
  }

  // Could be a partial email, needs to wrap it in double quotes so API won't escape the dot but final @ needs to be removed
  if (searchText.includes(".") && searchText.at(-1) === "@") {
    return `"${searchText.replace("@", "")}"*`
  }

  return `${wrapEmailInQuotes(searchText)}*`
}

// If an email is found in a sentence, wrap it in double quotes
function wrapEmailInQuotes(sentence: string): string {
  const sentenceHasWordsWithMultipleAtSymbols = sentence
    .split(" ")
    .some((word) => (word.match(/@/g) ?? []).length > 1)

  if (sentenceHasWordsWithMultipleAtSymbols) {
    return sentence
  }

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  return sentence.replace(emailRegex, '"$1"')
}
