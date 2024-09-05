import { useCoreApi } from '@commercelayer/app-elements'
import type {
  Link,
  ListResponse,
  QueryPageSize,
  Resource
} from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'
import { isMockedId } from '../mocks'

interface UseLinksListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  resourceId: Resource['id']
  resourceType: 'skus' | 'sku_lists'
  settings?: UseLinksListSettings
}

/**
 * Retrieves links related to a given resource.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `Links`.
 */

export function useLinksList({ resourceId, resourceType, settings }: Props): {
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
    resourceType,
    'links',
    isMockedId(resourceId)
      ? null
      : [
          resourceId,
          {
            sort: ['-created_at'],
            pageNumber,
            pageSize
          }
        ],
    {}
  )

  return { links, error, isLoading, mutate }
}
