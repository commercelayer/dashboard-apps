import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { SkuListItem } from '@commercelayer/sdk'

export function useSkuListItems(id: string): {
  skuListItems?: SkuListItem[]
  isLoadingItems: boolean
} {
  const pauseRequest = isMockedId(id) || id === ''
  const { data: skuListItems, isLoading: isLoadingItems } = useCoreApi(
    'sku_lists',
    'sku_list_items',
    pauseRequest
      ? null
      : [
          id,
          {
            include: ['sku'],
            sort: {
              position: 'asc'
            },
            pageSize: 25
          }
        ]
  )

  return { skuListItems, isLoadingItems }
}
