import type { Shipment, StockLineItem } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useActiveStockTransfers } from './useActiveStockTransfers'

/**
 * The stock transfers list is a list of faked stock_line_items based on active stock_transfers. Items of this list will be mapped below the picking list items in the same list.
 * @param shipment Shipment resource from SDK
 * @returns Array of StockLineItem resource
 */
export function useStockTransfersList(shipment: Shipment): StockLineItem[] {
  const activeStockTransfers = useActiveStockTransfers(shipment)
  return useMemo(
    () =>
      activeStockTransfers?.map((stockTransfer) => {
        return {
          id: stockTransfer.id,
          type: 'stock_line_items',
          created_at: '',
          updated_at: '',
          sku_code: stockTransfer.sku_code,
          quantity: stockTransfer.quantity,
          sku: {
            id: '',
            type: 'skus',
            created_at: '',
            updated_at: '',
            code: stockTransfer.line_item?.sku_code ?? '',
            name: stockTransfer.line_item?.name ?? '',
            image_url: stockTransfer.line_item?.image_url ?? ''
          },
          stockTransfer
        }
      }) ?? [],
    [activeStockTransfers]
  )
}
