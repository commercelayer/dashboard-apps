import { makePriceList } from '#mocks'
import { isMockedId, useCoreApi } from '@commercelayer/app-elements'
import type { PriceList } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function usePriceListDetails(id: string): {
  priceList: PriceList
  isLoading: boolean
  error: any
  mutatePriceList: KeyedMutator<PriceList>
} {
  const {
    data: priceList,
    isLoading,
    error,
    mutate: mutatePriceList
  } = useCoreApi(
    'price_lists',
    'retrieve',
    id !== '' && !isMockedId(id) ? [id] : null,
    {
      fallbackData: makePriceList()
    }
  )

  return { priceList, error, isLoading, mutatePriceList }
}
