import type { FormFullValues } from "@commercelayer/app-elements"
import type { Return } from "@commercelayer/sdk"

export interface ReturnTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/** Statuses a return can be listed under, mirroring the status filter. `draft` is not one of them. */
export const listableStatuses: Array<Return["status"]> = [
  "requested",
  "approved",
  "shipped",
  "received",
  "cancelled",
  "rejected",
  "refunded",
]

/** The terminal statuses, none of which has a tab of its own. */
const closedStatuses: Array<Return["status"]> = [
  "received",
  "cancelled",
  "rejected",
  "refunded",
]

/**
 * The tabs of the returns entry page, replacing the task links that used to be
 * on the home page.
 *
 * Every tab but `Archived` hides archived returns, as the previous "all returns"
 * view did; `Archived` is the only way to see them and so applies no status
 * filter of its own.
 */
export const returnTabs: ReturnTab[] = [
  {
    label: "All",
    formValues: {
      status_in: listableStatuses,
      archived_at_null: "hide",
      viewTitle: "All",
    },
  },
  {
    label: "Requested",
    formValues: {
      status_in: ["requested"],
      archived_at_null: "hide",
      viewTitle: "Requested",
    },
  },
  {
    label: "Approved",
    formValues: {
      status_in: ["approved"],
      archived_at_null: "hide",
      viewTitle: "Approved",
    },
  },
  {
    label: "Shipped",
    formValues: {
      status_in: ["shipped"],
      archived_at_null: "hide",
      viewTitle: "Shipped",
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
  {
    label: "Archived",
    formValues: {
      archived_at_null: "only",
      viewTitle: "Archived",
    },
  },
]
