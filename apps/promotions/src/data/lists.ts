import type { FormFullValues } from "@commercelayer/app-elements"

export interface PromotionTab {
  /** Tab label, intentionally not localized */
  label: string
  /**
   * Filters for the tab, as form values. They are written to the url query so
   * the active tab survives a refresh and can be shared.
   */
  formValues: FormFullValues
}

/**
 * The tabs of the promotions entry page.
 *
 * A promotion has no status attribute: whether it is active, upcoming or expired
 * is derived from `starts_at`/`expires_at` against the current time, and disabled
 * from `disabled_at`. The tabs therefore filter on dates.
 *
 * Built on call rather than at module load: the boundary is "now", and a tab list
 * frozen when the bundle was imported would drift for anyone leaving the dashboard
 * open — a promotion starting today would never show up as active.
 */
export function getPromotionTabs(): PromotionTab[] {
  const now = new Date().toJSON()

  return [
    {
      label: "All",
      formValues: {
        viewTitle: "All",
      },
    },
    {
      label: "Active",
      formValues: {
        starts_at_lteq: [now],
        expires_at_gteq: [now],
        disabled_at_null: "true",
        viewTitle: "Active",
      },
    },
    {
      label: "Upcoming",
      formValues: {
        starts_at_gt: [now],
        disabled_at_null: "true",
        viewTitle: "Upcoming",
      },
    },
    {
      label: "Disabled",
      formValues: {
        disabled_at_null: "false",
        viewTitle: "Disabled",
      },
    },
  ]
}
