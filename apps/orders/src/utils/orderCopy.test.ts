import type { Order, OrderCopy } from "@commercelayer/sdk"
import { describe, expect, test, vi } from "vitest"
import {
  canDuplicateOrder,
  getOrderCopyErrorMessage,
  waitForOrderCopy,
} from "#utils/orderCopy"

const messages = {
  aborted: "aborted",
  failed: "failed",
  timeout: "timeout",
}

const targetOrder = { id: "target", type: "orders" } as Order

/** Only what the helpers read. */
function makeOrderCopy(
  status: OrderCopy["status"],
  rest: Partial<OrderCopy> = {},
): OrderCopy {
  return { id: "copy", type: "order_copies", status, ...rest } as OrderCopy
}

describe("canDuplicateOrder", () => {
  test.each<[Order["status"], boolean]>([
    ["draft", false],
    ["pending", false],
    ["editing", false],
    ["placed", true],
    ["approved", true],
    ["cancelled", true],
  ])("an order %s can be duplicated: %s", (status, expected) => {
    expect(canDuplicateOrder({ status })).toBe(expected)
  })
})

describe("getOrderCopyErrorMessage", () => {
  test("reads every error of the log as one sentence", () => {
    expect(
      getOrderCopyErrorMessage({
        errors_log: {
          status: ["cannot transition from draft to placed"],
          line_items: ["are out of stock"],
        },
      }),
    ).toBe(
      "Status cannot transition from draft to placed. Line items are out of stock",
    )
  })

  test("reads the errors grouped by copy step once each", () => {
    expect(
      getOrderCopyErrorMessage({
        errors_log: {
          copy_order: { payment_method: ["is disabled"] },
          copy_addresses: { payment_method: ["is disabled"] },
          copy_payment_source: {
            order: ["Validation failed: Payment method is disabled"],
          },
        },
      }),
    ).toBe("Payment method is disabled")
  })

  test("is null without errors", () => {
    expect(getOrderCopyErrorMessage({ errors_log: null })).toBeNull()
    expect(getOrderCopyErrorMessage({ errors_log: {} })).toBeNull()
  })
})

describe("waitForOrderCopy", () => {
  test("returns the new order once the copy has completed", async () => {
    const retrieve = vi
      .fn<(id: string) => Promise<OrderCopy>>()
      .mockResolvedValueOnce(makeOrderCopy("in_progress"))
      .mockResolvedValueOnce(
        makeOrderCopy("completed", { target_order: targetOrder }),
      )

    await expect(
      waitForOrderCopy(makeOrderCopy("pending"), {
        retrieve,
        messages,
        intervalMs: 0,
      }),
    ).resolves.toBe(targetOrder)
    expect(retrieve).toHaveBeenCalledTimes(2)
  })

  test("throws the errors of a failed copy", async () => {
    await expect(
      waitForOrderCopy(
        makeOrderCopy("failed", {
          errors_log: { line_items: ["are out of stock"] },
        }),
        { retrieve: vi.fn(), messages },
      ),
    ).rejects.toThrow("Line items are out of stock")
  })

  test("throws a generic message for a failed copy without errors", async () => {
    await expect(
      waitForOrderCopy(makeOrderCopy("failed"), {
        retrieve: vi.fn(),
        messages,
      }),
    ).rejects.toThrow("failed")
  })

  test("throws when Core aborts a second copy of the same order", async () => {
    await expect(
      waitForOrderCopy(makeOrderCopy("aborted"), {
        retrieve: vi.fn(),
        messages,
      }),
    ).rejects.toThrow("aborted")
  })

  test("stops waiting after the timeout", async () => {
    const retrieve = vi
      .fn<(id: string) => Promise<OrderCopy>>()
      .mockResolvedValue(makeOrderCopy("in_progress"))

    await expect(
      waitForOrderCopy(makeOrderCopy("pending"), {
        retrieve,
        messages,
        intervalMs: 0,
        timeoutMs: 0,
      }),
    ).rejects.toThrow("timeout")
  })
})
