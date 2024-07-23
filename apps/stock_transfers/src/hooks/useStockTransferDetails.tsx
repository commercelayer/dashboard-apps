import { isMockedId, makeStockTransfer } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'

export const stockTransferIncludeAttribute = [
  'shipment.order',
  'shipment',
  'line_item',
  'origin_stock_location',
  'origin_stock_location.address',
  'destination_stock_location',
  'destination_stock_location.address'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStockTransferDetails(id: string) {
  const {
    data: stockTransfer,
    isLoading,
    mutate: mutateStockTransfer,
    isValidating
  } = useCoreApi(
    'stock_transfers',
    'retrieve',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: stockTransferIncludeAttribute
          }
        ],
    {
      fallbackData: makeStockTransfer()
    }
  )

  return { stockTransfer, isLoading, mutateStockTransfer, isValidating }
}
