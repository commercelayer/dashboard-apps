import { isMockedId, makeBundle } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

/**
 * Retrieves a `Bundle` resource.
 * @param id - The `id` of the wanted `Bundle` resource.
 * @returns a resolved `Bundle`.
 */

export function useBundleDetails(id: Bundle['id']): {
  bundle: Bundle
  isLoading: boolean
  error: any
  mutateBundle: KeyedMutator<Bundle>
} {
  const {
    data: bundle,
    isLoading,
    error,
    mutate: mutateBundle
  } = useCoreApi(
    'bundles',
    'retrieve',
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: ['market', 'sku_list']
          }
        ],
    {
      fallbackData: makeBundle()
    }
  )

  return { bundle, error, isLoading, mutateBundle }
}
