import { appRoutes, type PageProps } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import { isMockedId } from '#mocks'

import { LinkNewPage } from 'dashboard-apps-common/src/pages/LinkNewPage'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): JSX.Element {
  const skuListId = props.params?.resourceId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuListId })
  const { skuList, isLoading } = useSkuListDetails(skuListId)
  const pageDescription =
    isLoading || isMockedId(skuList.id)
      ? undefined
      : `Create a link to a microstore to directly sell ${skuList.name}.`

  return (
    <LinkNewPage
      resourceId={skuListId}
      resourceType='sku_lists'
      goBackUrl={goBackUrl}
      pageDescription={pageDescription}
    />
  )
}
