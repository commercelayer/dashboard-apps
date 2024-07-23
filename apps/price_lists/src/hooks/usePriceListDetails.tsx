import { isMockedId, makePriceList } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
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
  } = useCoreApi('price_lists', 'retrieve', !isMockedId(id) ? [id] : null, {
    fallbackData: makePriceList()
  })

  return { priceList, error, isLoading, mutatePriceList }
}
