import type { Order } from "@commercelayer/sdk"
import { getCustomerNote } from "./useSummaryRows"

function order(overrides: Partial<Order>): Order {
  return {
    type: "orders",
    id: "order1",
    status: "placed",
    notes: "We need delivery before September 15 if possible.",
    agreement: { type: "agreements", id: "agreement1" },
    order_reviews: [],
    created_at: "",
    updated_at: "",
    ...overrides,
  } as Order
}

const enabled = { isAgreementsEnabled: true }

describe("getCustomerNote", () => {
  it("shows the buyer's note on a placed agreement order", () => {
    expect(getCustomerNote(order({}), enabled)).toBe(
      "We need delivery before September 15 if possible.",
    )
  })

  it("keeps it while the seller edits the order", () => {
    expect(
      getCustomerNote(order({ status: "editing" }), enabled),
    ).not.toBeNull()
  })

  it("leaves it to the timeline once a review has been sent", () => {
    expect(
      getCustomerNote(
        order({
          order_reviews: [
            { type: "order_reviews", id: "r1" } as NonNullable<
              Order["order_reviews"]
            >[number],
          ],
        }),
        enabled,
      ),
    ).toBeNull()
  })

  it("is not shown once the order is approved", () => {
    expect(getCustomerNote(order({ status: "approved" }), enabled)).toBeNull()
  })

  it("needs a note, an agreement, and agreements switched on", () => {
    expect(getCustomerNote(order({ notes: "  " }), enabled)).toBeNull()
    expect(getCustomerNote(order({ agreement: null }), enabled)).toBeNull()
    expect(
      getCustomerNote(order({}), { isAgreementsEnabled: false }),
    ).toBeNull()
  })
})
