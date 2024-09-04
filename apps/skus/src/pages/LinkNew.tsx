import { appRoutes, type PageProps } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '#mocks'

import { LinkNewPage } from 'dashboard-apps-common/src/pages/LinkNewPage'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): JSX.Element {
  const skuId = props.params?.resourceId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuId })
  const { sku, isLoading } = useSkuDetails(skuId)
  const pageDescription =
    isLoading || isMockedId(sku.id)
      ? undefined
      : `Create a link to a microstore to directly sell ${sku.name}.`

  return (
    <LinkNewPage
      resourceId={skuId}
      resourceType='skus'
      goBackUrl={goBackUrl}
      pageDescription={pageDescription}
    />
  )
}
