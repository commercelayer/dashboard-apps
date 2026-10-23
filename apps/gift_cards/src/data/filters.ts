import type { FiltersInstructions } from "@commercelayer/app-elements"

interface PredicatePair {
  predicate: string
  value: string
}

/**
 * Pairs that must hold one at least, as the API's ransack OR group
 * `filter[q][g][0][m]=or`. Neither the filters nor the SDK model groups: the SDK
 * writes each predicate as `filter[q][${predicate}]`, so a predicate carrying the
 * group's brackets lands where the API reads it. One group per query: a second
 * call would share index 0.
 */
function anyOf(pairs: PredicatePair[]): PredicatePair[] {
  return [
    { predicate: "g][0][m", value: "or" },
    ...pairs.map(({ predicate, value }) => ({
      predicate: `g][0][${predicate}`,
      value,
    })),
  ]
}

/**
 * The API has no expired status for gift cards (see `getGiftCardDisplayStatus`),
 * so expiration gets a filter of its own, to combine with Status: an expired card
 * still carries its active or inactive status.
 *
 * Built at call time because its predicates compare against now.
 */
export function makeInstructions(now: Date = new Date()): FiltersInstructions {
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
      label: "Status",
      type: "options",
      sdk: {
        predicate: "status_in",
        defaultOptions: ["inactive", "active", "redeemed"],
      },
      render: {
        component: "inputSelect",
        props: {
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
      label: "Expiration",
      type: "groupedPredicates",
      urlParamKey: "expiration",
      render: {
        component: "inputSelect",
        props: {
          mode: "single",
          isClearable: true,
          options: [
            {
              value: "expired",
              label: "Expired",
              sdk: { predicate: "expires_at_lteq", value: now.toJSON() },
            },
            {
              value: "not_expired",
              label: "Not expired",
              sdk: anyOf([
                { predicate: "expires_at_null", value: "true" },
                { predicate: "expires_at_gt", value: now.toJSON() },
              ]),
            },
            {
              value: "expiring",
              label: "Expiring",
              sdk: { predicate: "expires_at_gt", value: now.toJSON() },
            },
            {
              value: "never",
              label: "Never expires",
              sdk: { predicate: "expires_at_null", value: "true" },
            },
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
}
