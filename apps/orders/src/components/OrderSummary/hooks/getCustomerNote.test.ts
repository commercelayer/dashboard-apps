import type { Order } from "@commercelayer/sdk"
import { getAgentNote, getCustomerNote } from "./useSummaryRows"

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

const agentReview = {
  type: "order_reviews",
  id: "r1",
  status: "pending",
  reason: "inbound_pending",
  notes: "Two lines had prices that differ from the email.",
  requester: { type: "agents", id: "agent1", name: "Frankie" },
  created_at: "2026-11-11T10:00:00Z",
} as unknown as NonNullable<Order["order_reviews"]>[number]

describe("an order an email-to-order agent held", () => {
  it("shows the buyer's note while it is a cart on hold", () => {
    expect(
      getCustomerNote(
        order({ status: "pending", order_reviews: [agentReview] }),
        enabled,
      ),
    ).toBe("We need delivery before September 15 if possible.")
  })

  it("shows what the agent said while the review is pending", () => {
    expect(
      getAgentNote(
        order({ status: "pending", order_reviews: [agentReview] }),
        enabled,
      ),
    ).not.toBeNull()
    expect(
      getAgentNote(
        order({
          status: "placed",
          order_reviews: [{ ...agentReview, status: "accepted" }],
        }),
        enabled,
      ),
    ).toBeNull()
  })

  it("has no agent note for a review the seller sent", () => {
    expect(
      getAgentNote(
        order({
          order_reviews: [
            { ...agentReview, requester: { type: "users", id: "u1" } },
          ] as Order["order_reviews"],
        }),
        enabled,
      ),
    ).toBeNull()
  })
})
