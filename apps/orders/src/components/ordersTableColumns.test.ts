import type { Order } from "@commercelayer/sdk"
import { getFormattedTotalAmount } from "#components/ordersTableColumns"

const metricsOrder = (total_amount: number, currency_code: string): Order =>
  ({ total_amount, currency_code }) as unknown as Order

describe("getFormattedTotalAmount", () => {
  test("Should return `formatted_total_amount` for a core API order", () => {
    expect(
      getFormattedTotalAmount({
        formatted_total_amount: "$163.60",
        currency_code: "USD",
      } as Order),
    ).toBe("$163.60")
  })

  test("Should format a metrics order with a two-decimal currency", () => {
    expect(getFormattedTotalAmount(metricsOrder(13600, "USD"))).toBe(
      "$13,600.00",
    )
    expect(getFormattedTotalAmount(metricsOrder(19.99, "USD"))).toBe("$19.99")
  })

  test("Should format a metrics order with a zero-decimal currency", () => {
    expect(getFormattedTotalAmount(metricsOrder(121000, "JPY"))).toBe(
      "¥121,000",
    )
  })

  test("Should format a metrics order with a three-decimal currency", () => {
    expect(getFormattedTotalAmount(metricsOrder(1.5, "KWD"))).toContain("1.500")
  })
})
