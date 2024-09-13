import { useCoreApi } from '@commercelayer/app-elements'
import type { ListResponse, QueryPageSize, SkuList } from '@commercelayer/sdk'

interface UseSkuListsListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  settings?: UseSkuListsListSettings
}

/**
 * Retrieves organization's SKU lists.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `SkuList`.
 */

export function useSkuListsList({ settings }: Props): {
  skuLists?: ListResponse<SkuList>
  isLoading: boolean
  error: any
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 10
  const filters = {
    manual_true: true
  }

  const {
    data: skuLists,
    isLoading,
    error
  } = useCoreApi(
    'sku_lists',
    'list',
    [
      {
        fields: ['id', 'name'],
        sort: ['name'],
        filters,
        pageNumber,
        pageSize
      }
    ],
    {}
  )

  return { skuLists, error, isLoading }
}
