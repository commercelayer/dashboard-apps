import { useCoreApi } from '@commercelayer/app-elements'
import type { ShippingCategory } from '@commercelayer/sdk'
import type { ListResponse } from '@commercelayer/sdk/lib/cjs/resource'

interface UseShippingCategoriesListSettings {
  pageNumber?: number
  pageSize?: number
}

interface Props {
  hint?: string
  settings?: UseShippingCategoriesListSettings
}

/**
 * Retrieves organization's customer groups providing an optional way to filter them by name.
 * @param hint - Optional string `hint` used in SDK request for filtering customer groups by `name` attr with LIKE behavior.
 * @param settings - Optional set of SDK request settings.
 * @returns a list of resolved `ShippingCategories`.
 */

export function useShippingCategoriesList({ hint, settings }: Props): {
  shippingCategories?: ListResponse<ShippingCategory>
  isLoading: boolean
  error: any
} {
  const pageNumber = settings?.pageNumber ?? 1
  const pageSize = settings?.pageSize ?? 10

  const {
    data: shippingCategories,
    isLoading,
    error
  } = useCoreApi(
    'shipping_categories',
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

  return { shippingCategories, error, isLoading }
}
