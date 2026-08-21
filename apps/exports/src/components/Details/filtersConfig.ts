import type { SearchableResource } from "#components/Form/ResourceFinder/utils"

/**
 * Filter fields whose value is a related resource id. The referenced
 * resource must be fetched to resolve the id into a human-readable name.
 */
export const RESOURCE_FILTER_FIELDS: Record<string, SearchableResource> = {
  market_in: "markets",
  market_id_in: "markets",
  tags_id_in: "tags",
  shipping_category_id_in: "shipping_categories",
  price_list_id_eq: "price_lists",
  promotion_rule_promotion_id_eq: "promotions",
  stock_location_id_in: "stock_locations",
}

/**
 * Filter fields whose value is already a human-readable code (a SKU code),
 * so no extra fetch is needed to display it.
 */
export const CODE_FILTER_FIELDS = new Set(["code_in", "sku_code_in"])

/** Overrides for the deduced label of specific fields whose name is redundant/confusing. */
const LABEL_OVERRIDES: Record<string, string> = {
  promotion_rule_promotion_id_eq: "Promotion",
}

/** Friendlier values for filter fields whose raw value isn't self-explanatory. */
export const VALUE_LABELS: Record<string, Record<string, string>> = {
  do_not_ship_false: {
    true: "Shippable SKU",
    false: "Non-shippable SKU",
  },
}

/**
 * Human-readable phrase for each Commerce Layer filtering predicate, to be
 * appended after the field label.
 * @see https://docs.commercelayer.io/core/filtering-data#list-of-predicates
 */
const OPERATOR_PHRASES: Record<string, string> = {
  eq: "",
  eq_or_null: "or empty",
  not_eq: "not",
  not_eq_or_null: "not or empty",
  not_eq_all: "none of",
  matches: "matches",
  does_not_match: "not matches",
  matches_any: "matches any",
  matches_all: "matches all",
  does_not_match_any: "not matches any",
  does_not_match_all: "not matches all",
  lt: "under",
  lteq: "up to",
  gt: "over",
  gteq: "from",
  lt_any: "under any",
  lteq_any: "up to any",
  gt_any: "over any",
  gteq_any: "from any",
  lt_all: "under all",
  lteq_all: "up to all",
  gt_all: "over all",
  gteq_all: "from all",
  present: "present",
  blank: "blank",
  null: "empty",
  not_null: "not empty",
  in: "",
  in_or_null: "or empty",
  not_in: "none of",
  not_in_or_null: "none of or empty",
  start: "starts",
  not_start: "not starts",
  start_any: "starts any",
  start_all: "starts all",
  not_start_any: "not starts any",
  not_start_all: "not starts all",
  end: "ends",
  not_end: "not ends",
  end_any: "ends any",
  end_all: "ends all",
  not_end_any: "not ends any",
  not_end_all: "not ends all",
  cont: "contains",
  not_cont: "not contains",
  cont_any: "contains any",
  not_cont_any: "not contains any",
  cont_all: "contains all",
  not_cont_all: "not contains all",
  i_cont: "contains",
  not_i_cont: "not contains",
  i_cont_any: "contains any",
  not_i_cont_any: "not contains any",
  i_cont_all: "contains all",
  not_i_cont_all: "not contains all",
  jcont: "contains",
  true: "true",
  false: "false",
}

const MAX_OPERATOR_TOKENS = Math.max(
  ...Object.keys(OPERATOR_PHRASES).map(
    (operator) => operator.split("_").length,
  ),
)

interface ParsedFilterField {
  /** field name tokens with the trailing operator removed, e.g. ["placed", "at"] */
  labelTokens: string[]
  /** the matched predicate suffix, e.g. "gteq", or null when not recognized */
  operator: string | null
}

function parseFilterField(field: string): ParsedFilterField {
  const tokens = field.split("_")

  for (
    let length = Math.min(MAX_OPERATOR_TOKENS, tokens.length - 1);
    length > 0;
    length--
  ) {
    const candidate = tokens.slice(-length).join("_")
    if (candidate in OPERATOR_PHRASES) {
      return { labelTokens: tokens.slice(0, -length), operator: candidate }
    }
  }

  return { labelTokens: tokens, operator: null }
}

/** A field is considered a date field when its label ends with "at" (placed_at, created_at, updated_at, ...). */
export function isDateFilterField(field: string): boolean {
  const { labelTokens } = parseFilterField(field)
  return labelTokens.at(-1) === "at"
}

/** A field is considered a metadata field when its label starts with "metadata" (metadata_jcont, ...). */
export function isMetadataFilterField(field: string): boolean {
  const { labelTokens } = parseFilterField(field)
  return labelTokens[0] === "metadata"
}

/** Deduces a human-readable label from a filter field name, e.g. "placed_at_gteq" -> "Placed from". */
export function filterFieldLabel(field: string): string {
  const { labelTokens, operator } = parseFilterField(field)
  const phrase = operator == null ? "" : OPERATOR_PHRASES[operator]

  const labelOverride = LABEL_OVERRIDES[field]
  if (labelOverride != null) {
    return phrase ? `${labelOverride} ${phrase}` : labelOverride
  }

  // The related resource is displayed by name, so the "id" token is redundant.
  const isResourceField = field in RESOURCE_FILTER_FIELDS
  const filteredTokens =
    isResourceField && labelTokens.at(-1) === "id"
      ? labelTokens.slice(0, -1)
      : labelTokens.at(-1) === "at"
        ? labelTokens.slice(0, -1)
        : labelTokens

  const label = filteredTokens
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return phrase ? `${label} ${phrase}` : label
}
