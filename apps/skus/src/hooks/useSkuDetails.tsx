import { isMockedId, makeSku } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useSkuDetails(id: string): {
  sku: Sku
  isLoading: boolean
  error: any
  mutateSku: KeyedMutator<Sku>
} {
  const {
    data: sku,
    isLoading,
    error,
    mutate: mutateSku
  } = useCoreApi(
    'skus',
    'retrieve',
    [
      id,
      {
        include: ['shipping_category']
      }
    ],
    {
      isPaused: () => isMockedId(id),
      fallbackData: makeSku()
    }
  )

  return { sku, error, isLoading, mutateSku }
}
