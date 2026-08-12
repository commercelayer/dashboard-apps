import { listableStatuses, stockTransferTabs } from "#data/lists"

describe("stockTransferTabs", () => {
  test("should have the expected tabs, in order", () => {
    expect(stockTransferTabs.map((tab) => tab.label)).toEqual([
      "All",
      "Upcoming",
      "Picking",
      "In transit",
      "On hold",
      "Closed",
    ])
  })

  test("every tab is restorable from the url via its viewTitle", () => {
    for (const tab of stockTransferTabs) {
      expect(tab.formValues.viewTitle).toBe(tab.label)
    }
  })

  test("every tab hides archived transfers", () => {
    for (const tab of stockTransferTabs) {
      expect(tab.formValues.archived_at_null).toBe("hide")
    }
  })

  test("`All` covers every listable status, and the other tabs are a subset of it", () => {
    const all = stockTransferTabs.find((tab) => tab.label === "All")
    expect(all?.formValues.status_in).toEqual(listableStatuses)
    // `draft` is deliberately not listable
    expect(listableStatuses).not.toContain("draft")

    for (const tab of stockTransferTabs) {
      const statuses = tab.formValues.status_in
      if (!Array.isArray(statuses)) {
        continue
      }
      for (const status of statuses) {
        expect(listableStatuses).toContain(status)
      }
    }
  })

  test("`Closed` groups the terminal statuses, which have no tab of their own", () => {
    const closed = stockTransferTabs.find((tab) => tab.label === "Closed")
    expect(closed?.formValues.status_in).toEqual(["completed", "cancelled"])

    const tabbedStatuses = stockTransferTabs
      .filter((tab) => tab.label !== "All")
      .flatMap((tab) =>
        Array.isArray(tab.formValues.status_in) ? tab.formValues.status_in : [],
      )
    // together the per-status tabs account for everything `All` lists
    expect([...tabbedStatuses].sort()).toEqual([...listableStatuses].sort())
  })
})
