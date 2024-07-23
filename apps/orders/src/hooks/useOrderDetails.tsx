import { isMockedId, makeOrder } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'

export const orderIncludeAttribute = [
  'market',
  'customer',
  'line_items',
  'line_items.line_item_options',
  'shipping_address',
  'billing_address',
  'shipments',
  'shipments.stock_transfers',
  'payment_method',
  'payment_source',

  // order editing
  'line_items.sku',
  'shipments.shipping_method',
  'shipments.available_shipping_methods',
  'shipments.stock_location',
  'shipments.stock_line_items',
  'shipments.stock_line_items.sku'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderDetails(id: string) {
  const {
    data: order,
    isLoading,
    mutate: mutateOrder,
    isValidating,
    error
  } = useCoreApi(
    'orders',
    'retrieve',
    !isMockedId(id) && !isEmpty(id)
      ? [
          id,
          {
            include: orderIncludeAttribute
          }
        ]
      : null,
    {
      fallbackData: makeOrder()
    }
  )

  return { order, isLoading, mutateOrder, isValidating, error }
}
