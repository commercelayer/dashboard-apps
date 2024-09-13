import { ListItemSkuListItem } from '#components/ListItemSkuListItem'
import { useSkuListItems } from '#hooks/useSkuListItems'
import { makeBundle } from '#mocks'
import { Section, SkeletonTemplate } from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  bundle: Bundle
}

export const BundleSkuList: FC<Props> = ({ bundle = makeBundle() }) => {
  const skuListId = bundle.sku_list?.id

  const { skuListItems, isLoadingItems } = useSkuListItems(skuListId ?? '')
  let totalQuantity = 0
  skuListItems?.forEach((item) => {
    totalQuantity += item?.quantity ?? 0
  })

  const isLoading = isLoadingItems || skuListId == null || skuListItems == null

  return (
    <Section title={`${bundle.sku_list?.name} (${totalQuantity})`}>
      <SkeletonTemplate isLoading={isLoading}>
        {skuListItems != null
          ? skuListItems.map((item) => (
              <ListItemSkuListItem key={item.sku_code} resource={item} />
            ))
          : null}
      </SkeletonTemplate>
    </Section>
  )
}
