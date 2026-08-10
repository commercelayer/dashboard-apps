import type { FormFullValues } from "@commercelayer/app-elements"

export interface ShipmentTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/** Statuses a shipment can be listed under, mirroring the status filter. */
const listableStatuses = [
  "picking",
  "packing",
  "ready_to_ship",
  "shipped",
  "delivered",
  "on_hold",
]

/**
 * The tabs of the shipments entry page, replacing the task links that used to be
 * on the home page.
 *
 * Every tab hides archived shipments, as the previous "all shipments" view did;
 * `Closed` groups the two terminal statuses, which have no task of their own.
 */
export const shipmentTabs: ShipmentTab[] = [
  {
    label: "All",
    formValues: {
      status_in: listableStatuses,
      archived_at_null: "hide",
      viewTitle: "All",
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
    label: "Packing",
    formValues: {
      status_in: ["packing"],
      archived_at_null: "hide",
      viewTitle: "Packing",
    },
  },
  {
    label: "Ready",
    formValues: {
      status_in: ["ready_to_ship"],
      archived_at_null: "hide",
      viewTitle: "Ready",
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
      status_in: ["shipped", "delivered"],
      archived_at_null: "hide",
      viewTitle: "Closed",
    },
  },
]
