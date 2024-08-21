import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type {
  Link,
  ListResponse,
  Order,
  QueryPageSize
} from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

interface UseLinksListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  orderId: Order['id']
  settings?: UseLinksListSettings
}

/**
 * Retrieves links related to a given order.
 * @param orderId - The order id.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `Links`.
 */

export function useLinksList({ orderId, settings }: Props): {
  links?: ListResponse<Link>
  isLoading: boolean
  error: any
  mutateLinks: KeyedMutator<ListResponse<Link>>
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 25

  const {
    data: links,
    isLoading,
    error,
    mutate: mutateLinks
  } = useCoreApi(
    'orders',
    'links',
    isMockedId(orderId)
      ? null
      : [
          orderId,
          {
            sort: ['created_at'],
            pageNumber,
            pageSize
          }
        ],
    {}
  )

  return { links, error, isLoading, mutateLinks }
}
