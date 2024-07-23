import { useCoreApi } from '@commercelayer/app-elements'
import type {
  CustomerGroup,
  ListResponse,
  QueryPageSize
} from '@commercelayer/sdk'

interface UseCustomerGroupsListSettings {
  pageNumber?: number
  pageSize?: QueryPageSize
}

interface Props {
  hint?: string
  settings?: UseCustomerGroupsListSettings
}

/**
 * Retrieves organization's customer groups providing an optional way to filter them by name.
 * @param hint - Optional string `hint` used in SDK request for filtering customer groups by `name` attr with LIKE behavior.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `CustomerGroups`.
 */

export function useCustomerGroupsList({ hint, settings }: Props): {
  customerGroups?: ListResponse<CustomerGroup>
  isLoading: boolean
  error: any
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 10

  const {
    data: customerGroups,
    isLoading,
    error
  } = useCoreApi(
    'customer_groups',
    'list',
    [
      {
        fields: ['id', 'name'],
        filters: hint != null ? { name_cont: hint } : undefined,
        sort: ['name'],
        pageNumber,
        pageSize
      }
    ],
    {}
  )

  return { customerGroups, error, isLoading }
}
