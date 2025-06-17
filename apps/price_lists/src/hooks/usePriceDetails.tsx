import { makePrice } from '#mocks'
import { isMockedId, useCoreApi } from '@commercelayer/app-elements'
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
            include: [
              'sku',
              'price_volume_tiers',
              'price_frequency_tiers',
              'price_list'
            ]
          }
        ]
      : null,
    {
      fallbackData: makePrice()
    }
  )

  return { price, error, isLoading, mutatePrice }
}
