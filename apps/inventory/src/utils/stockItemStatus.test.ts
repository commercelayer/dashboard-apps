import type { ReservedStock } from "@commercelayer/sdk"
import { getStockItemStatus } from "./stockItemStatus"

const reserved = (quantity: number): ReservedStock => ({
  id: "reserved",
  type: "reserved_stocks",
  quantity,
  created_at: "",
  updated_at: "",
})

describe("getStockItemStatus", () => {
  test("is out of stock when nothing is on hand", () => {
    expect(getStockItemStatus({ quantity: 0, low_quantity: 10 })).toBe(
      "out_of_stock",
    )
  })

  test("is in stock when no threshold is set", () => {
    expect(getStockItemStatus({ quantity: 2, low_quantity: null })).toBe(
      "in_stock",
    )
  })

  test("is low stock when the quantity is below the threshold", () => {
    expect(getStockItemStatus({ quantity: 9, low_quantity: 10 })).toBe(
      "low_stock",
    )
  })

  test("is in stock when the quantity equals the threshold", () => {
    expect(getStockItemStatus({ quantity: 10, low_quantity: 10 })).toBe(
      "in_stock",
    )
  })

  test("is low stock when reservations take the available quantity below the threshold", () => {
    expect(
      getStockItemStatus({
        quantity: 20,
        low_quantity: 10,
        reserved_stock: reserved(15),
      }),
    ).toBe("low_stock")
  })

  test("is low stock, not out of stock, when everything on hand is reserved", () => {
    expect(
      getStockItemStatus({
        quantity: 5,
        low_quantity: 10,
        reserved_stock: reserved(5),
      }),
    ).toBe("low_stock")
  })
})
