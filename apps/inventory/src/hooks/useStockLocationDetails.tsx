import { isMockedId, makeStockLocation } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
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
  } = useCoreApi('stock_locations', 'retrieve', !isMockedId(id) ? [id] : null, {
    fallbackData: makeStockLocation()
  })

  return { stockLocation, error, isLoading, mutateStockLocation }
}
