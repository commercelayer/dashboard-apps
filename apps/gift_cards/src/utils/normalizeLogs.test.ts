import { describe, expect, it } from "vitest"
import { normalizeLogs } from "./normalizeLogs"

describe("normalizeLogs", () => {
  it("should normalize usage logs correctly", () => {
    const result = normalizeLogs({
      usageLog: {
        "order-1": [
          {
            action: "purchase",
            datetime: "2024-09-18T16:00:00.000Z",
            amount_cents: 0,
            balance_cents: 10000,
          },
        ],
        "order-2": [
          {
            action: "use",
            datetime: "2024-09-20T11:00:00.000Z",
            amount_cents: -5000,
            balance_cents: 5000,
            order_number: "123456789",
          },
        ],
        "order-3": [
          {
            action: "redeemed",
            datetime: "2024-09-22T16:00:00.000Z",
            amount_cents: -5000,
            balance_cents: 0,
          },
        ],
      },
      balanceLog: [
        {
          datetime: "2024-09-18T16:00:00.000Z",
          balance_change_cents: 10000,
        },
        {
          datetime: "2024-09-20T11:00:00.000Z",
          balance_change_cents: -5000,
        },
        {
          datetime: "2024-09-22T16:00:00.000Z",
          balance_change_cents: -5000,
        },
      ],
    })

    expect(result).toEqual([
      {
        isoDate: "2024-09-22T16:00:00.000Z",
        type: "Redeemed",
        orderId: "order-3",
        orderNumber: undefined,
        amountCents: -5000,
      },
      {
        isoDate: "2024-09-20T11:00:00.000Z",
        type: "Use",
        orderId: "order-2",
        orderNumber: "123456789",
        amountCents: -5000,
      },
      {
        isoDate: "2024-09-18T16:00:00.000Z",
        type: "Purchase",
        orderId: "order-1",
        orderNumber: undefined,
        amountCents: 0,
      },
      {
        isoDate: "2024-09-18T16:00:00.000Z",
        type: "Change",
        orderId: undefined,
        orderNumber: undefined,
        amountCents: 10000,
      },
    ])
  })

  it("should handle empty logs", () => {
    const result = normalizeLogs({
      usageLog: null,
      balanceLog: null,
    })

    expect(result).toEqual([])
  })

  it("should deduplicate balance entries that match a usage entry by second and amount", () => {
    const result = normalizeLogs({
      usageLog: {
        "order-1": [
          {
            action: "use",
            datetime: "2024-09-20T11:00:00.123Z",
            amount_cents: -5000,
            balance_cents: 5000,
          },
        ],
      },
      balanceLog: [
        {
          // exact match on second + amount (different ms) — must be removed
          datetime: "2024-09-20T11:00:00.456Z",
          balance_change_cents: -5000,
        },
        {
          // same second, different amount — must be kept
          datetime: "2024-09-20T11:00:00.000Z",
          balance_change_cents: -3000,
        },
      ],
    })

    expect(result).toEqual([
      {
        isoDate: "2024-09-20T11:00:00.123Z",
        type: "Use",
        orderId: "order-1",
        orderNumber: undefined,
        amountCents: -5000,
      },
      {
        isoDate: "2024-09-20T11:00:00.000Z",
        type: "Change",
        orderId: undefined,
        orderNumber: undefined,
        amountCents: -3000,
      },
    ])
  })
})
