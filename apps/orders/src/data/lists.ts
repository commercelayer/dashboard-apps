import type { FormFullValues } from "@commercelayer/app-elements"
import { t } from "@commercelayer/app-elements"

export type ListType =
  | "awaitingApproval"
  | "editing"
  | "paymentToCapture"
  | "fulfillmentInProgress"
  | "archived"
  | "pending"
  | "history"

export const presets: Record<ListType, FormFullValues> = {
  awaitingApproval: {
    status_in: ["placed"],
    payment_status_in: ["authorized", "free", "paid"],
    archived: "hide",
    viewTitle: t("apps.orders.tasks.awaiting_approval"),
  },
  editing: {
    status_in: ["editing"],
    payment_status_in: [],
    archived: "hide",
    viewTitle: t("apps.orders.tasks.editing"),
  },
  paymentToCapture: {
    status_in: ["approved"],
    payment_status_in: ["authorized"],
    archived: "hide",
    viewTitle: t("apps.orders.tasks.payment_to_capture"),
  },
  fulfillmentInProgress: {
    status_in: ["approved"],
    fulfillment_status_in: ["in_progress"],
    archived: "hide",
    viewTitle: t("apps.orders.tasks.fulfillment_in_progress"),
  },
  history: {
    archived: "hide",
    viewTitle: t("apps.orders.tasks.history"),
  },
  pending: {
    status_in: ["pending"],
    archived: "show",
    viewTitle: t("apps.orders.tasks.carts"),
  },
  archived: {
    archived: "only",
    viewTitle: t("apps.orders.tasks.archived"),
  },
}

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
}

/**
 * Predicates used by the tabs that are not part of the filters instructions and
 * therefore need to be whitelisted in `useResourceFilters`.
 */
export const orderTabsPredicateWhitelist = ["fulfillment_status_not_in"]

/**
 * The tabs of the orders entry page.
 *
 * Filters are AND-ed across attributes (there is no OR between them), so each
 * state is spelled out with the values it allows or excludes:
 * - a status list without `pending` also excludes drafts
 * - "not fulfilled" is expressed as `fulfillment_status_not_in: ["fulfilled"]`
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
    label: "Open",
    // still needs work: to be approved, to be captured, or to be fulfilled.
    // `fulfillment_status_not_in` (whitelisted in the page) rather than listing
    // the allowed values: the metrics API only knows `unfulfilled`,
    // `in_progress` and `fulfilled` — it rejects `not_required` — and orders
    // with no fulfillment status yet must count as open too.
    formValues: {
      status_in: ["placed", "approved"],
      fulfillment_status_not_in: ["fulfilled"],
      archived: "hide",
      viewTitle: "Open",
    },
    sortBy: "order.placed_at",
  },
  {
    label: "Closed",
    formValues: {
      status_in: ["approved"],
      payment_status_in: ["paid"],
      fulfillment_status_in: ["fulfilled"],
      archived: "hide",
      viewTitle: "Closed",
    },
    sortBy: "order.placed_at",
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
