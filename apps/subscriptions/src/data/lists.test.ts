import { listableStatuses, subscriptionTabs } from "#data/lists"

describe("subscriptionTabs", () => {
  test("should have the expected tabs, in order", () => {
    expect(subscriptionTabs.map((tab) => tab.label)).toEqual([
      "All",
      "Active",
      "Pending",
      "Inactive",
      "Cancelled",
    ])
  })

  test("every tab is restorable from the url via its viewTitle", () => {
    for (const tab of subscriptionTabs) {
      expect(tab.formValues.viewTitle).toBe(tab.label)
    }
  })

  test("`All` covers every listable status, and the other tabs are a subset of it", () => {
    const all = subscriptionTabs.find((tab) => tab.label === "All")
    expect(all?.formValues.status_in).toEqual([...listableStatuses])
    // `draft` is deliberately not listable
    expect(listableStatuses).not.toContain("draft")

    for (const tab of subscriptionTabs) {
      const statuses = tab.formValues.status_in
      if (!Array.isArray(statuses)) {
        continue
      }
      for (const status of statuses) {
        expect(listableStatuses).toContain(status)
      }
    }
  })

  test("the per-status tabs together account for everything `All` lists", () => {
    const tabbedStatuses = subscriptionTabs
      .filter((tab) => tab.label !== "All")
      .flatMap((tab) =>
        Array.isArray(tab.formValues.status_in) ? tab.formValues.status_in : [],
      )
    expect([...tabbedStatuses].sort()).toEqual([...listableStatuses].sort())
  })

  test("`pending` is listed, being a real API status the SDK types lag behind", () => {
    expect(listableStatuses).toContain("pending")
  })
})
