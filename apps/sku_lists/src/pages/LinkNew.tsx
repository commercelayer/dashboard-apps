import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { isMockedId } from '@commercelayer/app-elements'

import { LinkNewPage } from 'dashboard-apps-common/src/pages/LinkNewPage'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): React.JSX.Element {
  const skuListId = props.params?.resourceId ?? ''
  const goBackUrl = `${appRoutes.details.makePath({ skuListId })}?tab=links`

  const { skuList, isLoading } = useSkuListDetails(skuListId)
  const defaultName = isLoading || isMockedId(skuList.id) ? '' : skuList.name

  return (
    <LinkNewPage
      resourceId={skuListId}
      resourceType='sku_lists'
      goBackUrl={goBackUrl}
      defaultName={defaultName}
    />
  )
}
