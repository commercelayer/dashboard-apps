import { useCoreApi } from '@commercelayer/app-elements'
import type { ListResponse, Market, QueryPageSize } from '@commercelayer/sdk'

interface UseMarketsListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  settings?: UseMarketsListSettings
}

/**
 * Retrieves organization's markets providing an optional way to filter them by name.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `Markets`.
 */

export function useMarketsList({ settings }: Props): {
  markets?: ListResponse<Market>
  isLoading: boolean
  error: any
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 25

  const {
    data: markets,
    isLoading,
    error
  } = useCoreApi(
    'markets',
    'list',
    [
      {
        fields: ['id', 'name'],
        sort: ['name'],
        pageNumber,
        pageSize
      }
    ],
    {}
  )

  return { markets, error, isLoading }
}
