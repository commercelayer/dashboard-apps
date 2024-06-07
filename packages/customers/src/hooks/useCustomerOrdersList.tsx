import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import type { ListResponse } from '@commercelayer/sdk/lib/cjs/resource'

interface UseCustomerOrdersListSettings {
  pageNumber?: number
  pageSize?: number
}

interface Props {
  id: string
  settings?: UseCustomerOrdersListSettings
}

/**
 * Retrieves customer orders via relationship by customer id.
 * @param id - Customer `id` used in SDK relationship request.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `Orders` of requested customer.
 */

export function useCustomerOrdersList({ id, settings }: Props): {
  orders: ListResponse<Order> | undefined
  isLoading: boolean
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 25

  const { data: orders, isLoading } = useCoreApi(
    'customers',
    'orders',
    isMockedId(id)
      ? null
      : [
          id,
          {
            filters: {
              status_matches_any: 'placed,approved,editing,cancelled'
            },
            include: ['billing_address', 'market'],
            sort: ['-created_at'],
            pageNumber,
            pageSize
          },
          {}
        ]
  )

  return { orders, isLoading }
}
