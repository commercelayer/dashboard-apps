import { makeReturn } from '#mocks'
import { isMockedId, useCoreApi } from '@commercelayer/app-elements'

export const returnIncludeAttribute = [
  'stock_location',
  'order',
  'order.market',
  'order.captures',
  'customer',
  'return_line_items',
  'origin_address',
  'destination_address'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReturnDetails(id: string) {
  const {
    data: returnObj,
    isLoading,
    mutate: mutateReturn,
    isValidating
  } = useCoreApi(
    'returns',
    'retrieve',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: returnIncludeAttribute
          }
        ],
    {
      fallbackData: makeReturn()
    }
  )

  return { returnObj, isLoading, mutateReturn, isValidating }
}
