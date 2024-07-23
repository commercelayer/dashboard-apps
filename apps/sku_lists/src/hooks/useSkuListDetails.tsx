import { isMockedId, makeSkuList } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useSkuListDetails(id: string): {
  skuList: SkuList
  isLoading: boolean
  error: any
  mutateSkuList: KeyedMutator<SkuList>
} {
  const {
    data: skuList,
    isLoading,
    error,
    mutate: mutateSkuList
  } = useCoreApi('sku_lists', 'retrieve', isMockedId(id) ? null : [id], {
    fallbackData: makeSkuList()
  })

  return { skuList, error, isLoading, mutateSkuList }
}
