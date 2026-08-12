import type { FormFullValues } from "@commercelayer/app-elements"

export interface SubscriptionTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/**
 * Statuses a subscription can be listed under. `draft` is not one of them, and
 * `pending` is not yet in the SDK status union (beta.9), hence the plain strings.
 */
export const listableStatuses = [
  "active",
  "pending",
  "inactive",
  "cancelled",
] as const

/**
 * The tabs of the subscriptions entry page.
 *
 * A failed last run is deliberately not a tab: it is a property of the latest
 * renewal rather than a status, and the table surfaces it in the `Last run`
 * column. A failed subscription therefore still appears under its own status.
 */
export const subscriptionTabs: SubscriptionTab[] = [
  {
    label: "All",
    formValues: {
      status_in: [...listableStatuses],
      viewTitle: "All",
    },
  },
  {
    label: "Active",
    formValues: {
      status_in: ["active"],
      viewTitle: "Active",
    },
  },
  {
    label: "Pending",
    formValues: {
      status_in: ["pending"],
      viewTitle: "Pending",
    },
  },
  {
    label: "Inactive",
    formValues: {
      status_in: ["inactive"],
      viewTitle: "Inactive",
    },
  },
  {
    label: "Cancelled",
    formValues: {
      status_in: ["cancelled"],
      viewTitle: "Cancelled",
    },
  },
]
