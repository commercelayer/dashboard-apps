import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type {
  Link,
  ListResponse,
  QueryPageSize,
  SkuList
} from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

interface UseLinksListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  skuListId: SkuList['id']
  settings?: UseLinksListSettings
}

/**
 * Retrieves organization's markets providing an optional way to filter them by name.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `Links`.
 */

export function useLinksList({ skuListId, settings }: Props): {
  links?: ListResponse<Link>
  isLoading: boolean
  error: any
  mutate: KeyedMutator<ListResponse<Link>>
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 25

  const {
    data: links,
    isLoading,
    error,
    mutate
  } = useCoreApi(
    'sku_lists',
    'links',
    isMockedId(skuListId)
      ? null
      : [
          skuListId,
          {
            sort: ['created_at'],
            pageNumber,
            pageSize
          }
        ],
    {}
  )

  return { links, error, isLoading, mutate }
}
