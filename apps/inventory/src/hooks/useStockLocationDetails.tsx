import { makeStockLocation } from '#mocks'
import { isMockedId, useCoreApi } from '@commercelayer/app-elements'
import type { StockLocation } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useStockLocationDetails(id: string): {
  stockLocation: StockLocation
  isLoading: boolean
  error: any
  mutateStockLocation: KeyedMutator<StockLocation>
} {
  const {
    data: stockLocation,
    isLoading,
    error,
    mutate: mutateStockLocation
  } = useCoreApi(
    'stock_locations',
    'retrieve',
    id !== '' && !isMockedId(id) ? [id] : null,
    {
      fallbackData: makeStockLocation()
    }
  )

  return { stockLocation, error, isLoading, mutateStockLocation }
}
