import { useCoreApi } from '@commercelayer/app-elements'
import type { Customer, ListResponse, QueryPageSize } from '@commercelayer/sdk'

interface UseCustomerAnonymizedPendingListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  settings?: UseCustomerAnonymizedPendingListSettings
}

/**
 * Retrieves organization's customer groups providing an optional way to filter them by name.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `CustomerAnonymizedPending`.
 */

export function useCustomerAnonymizedPendingList({ settings }: Props): {
  customers?: ListResponse<Customer>
  isLoading: boolean
  error: any
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 10

  const {
    data: customers,
    isLoading,
    error
  } = useCoreApi(
    'customers',
    'list',
    [
      {
        filters: { anonymization_status_eq: 'requested' },
        pageNumber,
        pageSize
      }
    ],
    {}
  )

  return { customers, error, isLoading }
}
