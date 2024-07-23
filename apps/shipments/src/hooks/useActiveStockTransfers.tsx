import type { Shipment, StockTransfer } from '@commercelayer/sdk'

/**
 * This hook verifies if given shipment has active stock transfers
 * @param shipment Shipment resource from SDK
 * @returns boolean condition
 */
export function useActiveStockTransfers(shipment: Shipment): StockTransfer[] {
  return (
    shipment.stock_transfers?.filter(
      (stockTransfer) =>
        stockTransfer.status !== 'completed' &&
        stockTransfer.status !== 'cancelled' &&
        stockTransfer.status !== 'draft'
    ) ?? []
  )
}
