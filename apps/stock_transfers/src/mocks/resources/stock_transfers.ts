import type { StockTransfer } from "@commercelayer/sdk"
import { makeLineItem, makeShipment } from "#mocks"
import { makeResource } from "../resource"

export const makeStockTransfer = (): StockTransfer => {
  return {
    ...makeResource("stock_transfers"),
    status: "draft",
    quantity: 1,
    line_item: makeLineItem(),
    shipment: makeShipment(),
  }
}
