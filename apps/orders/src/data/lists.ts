import type { FormFullValues } from "@commercelayer/app-elements"
import type { HideableFilter } from "./filters"

export interface OrderTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
  /** Metrics attribute the tab is sorted by, descending. */
  sortBy: "order.placed_at" | "order.updated_at"
  /**
   * Which filters instructions the tab needs. Carts are served by the metrics
   * `/carts` endpoint, which rejects the `placed_at` date field used by the
   * standard instructions' time range.
   */
  instructions?: "carts"
  /**
   * Draws a rule before this tab, to set what follows apart: the states an order
   * moves through, then the shelves it can sit on (carts, archive).
   */
  separatorBefore?: boolean
  /**
   * Filters the tab decides itself, kept out of the drawer: on the Placed tab the
   * status is the tab, so offering a status field there only invites the user to
   * contradict it. The value still applies — see `makeInstructions`.
   */
  hiddenFilters?: HideableFilter[]
}

/**
 * Predicates used by the tabs that are not part of the filters instructions and
 * therefore need to be whitelisted in `useResourceFilters`.
 *
 * `fulfillment_statuses_not_in` is how the Approved tab keeps orders that are
 * already being fulfilled out: the drawer only offers `fulfillment_statuses_in`, and
 * the two
 * would be AND-ed rather than combined.
 */
export const orderTabsPredicateWhitelist = ["fulfillment_statuses_not_in"]

/**
 * The tabs of the orders entry page.
 *
 * Filters are AND-ed across attributes (there is no OR between them), so a tab can
 * only pin one shape: `status_in` for where the order is in its own lifecycle,
 * `fulfillment_statuses_in` for how far its fulfillment has got. Tabs that pin one of
 * those hide the matching drawer field via `hiddenFilters`.
 */
export const orderTabs: OrderTab[] = [
  {
    label: "All",
    formValues: {
      status_in: ["placed", "approved", "cancelled", "editing"],
      archived: "hide",
      viewTitle: "All",
    },
    sortBy: "order.placed_at",
  },
  {
    label: "Placed",
    // waiting to be approved
    formValues: {
      status_in: ["placed"],
      archived: "hide",
      viewTitle: "Placed",
    },
    sortBy: "order.placed_at",
    hiddenFilters: ["status_in"],
  },
  {
    label: "Approved",
    // Approved and not being fulfilled yet: once fulfillment starts the order
    // belongs to In progress, and once it finishes, to Fulfilled.
    formValues: {
      status_in: ["approved"],
      fulfillment_statuses_not_in: ["fulfilled", "in_progress"],
      archived: "hide",
      viewTitle: "Approved",
    },
    sortBy: "order.placed_at",
    hiddenFilters: ["status_in", "fulfillment_statuses_in"],
  },
  {
    label: "In progress",
    // Being fulfilled. Only the fulfillment status is pinned: the status field
    // stays in the drawer, where its default options already exclude carts.
    formValues: {
      fulfillment_statuses_in: ["in_progress"],
      archived: "hide",
      viewTitle: "In progress",
    },
    sortBy: "order.placed_at",
    hiddenFilters: ["fulfillment_statuses_in"],
  },
  {
    label: "Fulfilled",
    formValues: {
      fulfillment_statuses_in: ["fulfilled"],
      archived: "hide",
      viewTitle: "Fulfilled",
    },
    sortBy: "order.placed_at",
    hiddenFilters: ["fulfillment_statuses_in"],
  },
  {
    label: "Carts",
    // Pending orders are served by the metrics `/carts` endpoint, which differs
    // from `/orders`: it has no `placed_at` to sort by, and it cannot filter on
    // `archived_at` at all — hence `archived: "show"`, which emits no archived
    // predicate (any other value makes the request fail).
    formValues: {
      status_in: ["pending"],
      archived: "show",
      viewTitle: "Carts",
    },
    sortBy: "order.updated_at",
    instructions: "carts",
    separatorBefore: true,
  },
  {
    label: "Archived",
    formValues: {
      archived: "only",
      viewTitle: "Archived",
    },
    sortBy: "order.placed_at",
  },
]
