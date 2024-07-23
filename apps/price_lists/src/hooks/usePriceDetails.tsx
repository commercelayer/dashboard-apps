import { isMockedId, makePrice } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Price } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function usePriceDetails(id: string): {
  price: Price
  isLoading: boolean
  error: any
  mutatePrice: KeyedMutator<Price>
} {
  const {
    data: price,
    isLoading,
    error,
    mutate: mutatePrice
  } = useCoreApi(
    'prices',
    'retrieve',
    !isMockedId(id)
      ? [
          id,
          {
            include: ['sku', 'price_volume_tiers', 'price_frequency_tiers']
          }
        ]
      : null,
    {
      fallbackData: makePrice()
    }
  )

  return { price, error, isLoading, mutatePrice }
}
