import { makeOrder } from '#mocks'
import {
  isMockedId,
  orderTransactionIsAnAsyncCapture,
  useCoreApi
} from '@commercelayer/app-elements'
import isEmpty from 'lodash-es/isEmpty'

export const orderIncludeAttribute = [
  'market',
  'customer',
  'customer.customer_addresses',
  'customer.customer_addresses.address',
  'line_items',
  'line_items.gift_card',
  'line_items.line_item_options',
  'shipping_address',
  'billing_address',
  'shipments',
  'shipments.line_items', // required to check returnable items for delivered shipments
  'shipments.stock_transfers',
  'payment_method',
  'payment_source',
  'transactions',

  // order editing
  'line_items.sku',
  'shipments.shipping_method',
  'shipments.available_shipping_methods',
  'shipments.stock_location',
  'shipments.shipping_method',
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
      fallbackData: makeOrder(),
      refreshInterval: (order) => {
        return (order?.transactions ?? []).some(
          orderTransactionIsAnAsyncCapture
        )
          ? 5000
          : 0
      }
    }
  )

  return { order, isLoading, mutateOrder, isValidating, error }
}
