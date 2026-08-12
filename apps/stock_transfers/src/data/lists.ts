import type { FormFullValues } from "@commercelayer/app-elements"
import type { StockTransfer } from "@commercelayer/sdk"

export interface StockTransferTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/** Statuses a stock transfer can be listed under. `draft` is not one of them. */
export const listableStatuses: Array<StockTransfer["status"]> = [
  "upcoming",
  "picking",
  "in_transit",
  "on_hold",
  "completed",
  "cancelled",
]

/** The terminal statuses, neither of which has a tab of its own. */
const closedStatuses: Array<StockTransfer["status"]> = [
  "completed",
  "cancelled",
]

/**
 * The tabs of the stock transfers entry page, replacing the task links that used
 * to be on the home page.
 *
 * Every tab hides archived transfers, as the previous "all stock transfers" view
 * did; `Closed` groups the two terminal statuses, which have no task of their own.
 */
export const stockTransferTabs: StockTransferTab[] = [
  {
    label: "All",
    formValues: {
      status_in: listableStatuses,
      archived_at_null: "hide",
      viewTitle: "All",
    },
  },
  {
    label: "Upcoming",
    formValues: {
      status_in: ["upcoming"],
      archived_at_null: "hide",
      viewTitle: "Upcoming",
    },
  },
  {
    label: "Picking",
    formValues: {
      status_in: ["picking"],
      archived_at_null: "hide",
      viewTitle: "Picking",
    },
  },
  {
    label: "In transit",
    formValues: {
      status_in: ["in_transit"],
      archived_at_null: "hide",
      viewTitle: "In transit",
    },
  },
  {
    label: "On hold",
    formValues: {
      status_in: ["on_hold"],
      archived_at_null: "hide",
      viewTitle: "On hold",
    },
  },
  {
    label: "Closed",
    formValues: {
      status_in: closedStatuses,
      archived_at_null: "hide",
      viewTitle: "Closed",
    },
  },
]
