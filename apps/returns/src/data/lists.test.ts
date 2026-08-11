import { listableStatuses, returnTabs } from "#data/lists"

describe("returnTabs", () => {
  test("should have the expected tabs, in order", () => {
    expect(returnTabs.map((tab) => tab.label)).toEqual([
      "All",
      "Requested",
      "Approved",
      "Shipped",
      "Closed",
      "Archived",
    ])
  })

  test("every tab is restorable from the url via its viewTitle", () => {
    for (const tab of returnTabs) {
      expect(tab.formValues.viewTitle).toBe(tab.label)
    }
  })

  test("hides archived returns everywhere but the Archived tab, which is the only way to see them", () => {
    for (const tab of returnTabs) {
      expect(tab.formValues.archived_at_null).toBe(
        tab.label === "Archived" ? "only" : "hide",
      )
    }
  })

  test("the Archived tab applies no status filter, so nothing archived is hidden by status", () => {
    const archived = returnTabs.find((tab) => tab.label === "Archived")
    expect(archived?.formValues.status_in).toBeUndefined()
  })

  test("`All` covers every listable status, and the per-status tabs are a subset of it", () => {
    const all = returnTabs.find((tab) => tab.label === "All")
    expect(all?.formValues.status_in).toEqual(listableStatuses)
    // `draft` is deliberately not listable
    expect(listableStatuses).not.toContain("draft")

    for (const tab of returnTabs) {
      const statuses = tab.formValues.status_in
      if (!Array.isArray(statuses)) {
        continue
      }
      for (const status of statuses) {
        expect(listableStatuses).toContain(status)
      }
    }
  })
})
