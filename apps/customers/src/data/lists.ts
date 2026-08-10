import type { FormFullValues } from "@commercelayer/app-elements"

export interface CustomerTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/**
 * The tabs of the customers entry page, one per customer status plus an
 * unfiltered one.
 */
export const customerTabs: CustomerTab[] = [
  {
    label: "All",
    formValues: {
      status_in: ["prospect", "acquired", "repeat"],
      viewTitle: "All",
    },
  },
  {
    label: "Prospect",
    formValues: {
      status_in: ["prospect"],
      viewTitle: "Prospect",
    },
  },
  {
    label: "Acquired",
    formValues: {
      status_in: ["acquired"],
      viewTitle: "Acquired",
    },
  },
  {
    label: "Repeat",
    formValues: {
      status_in: ["repeat"],
      viewTitle: "Repeat",
    },
  },
]
