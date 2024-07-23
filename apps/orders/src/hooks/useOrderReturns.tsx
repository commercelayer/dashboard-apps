import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'

export const orderIncludeAttribute = [
  'order',
  'order.market',
  'return_line_items',
  'origin_address',
  'stock_location',
  'stock_location.address'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderReturns(id: string) {
  const { data: returns, isLoading: isLoadingReturns } = useCoreApi(
    'orders',
    'returns',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: orderIncludeAttribute
          }
        ]
  )

  return { returns, isLoadingReturns }
}
