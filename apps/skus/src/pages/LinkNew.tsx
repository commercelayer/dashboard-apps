import { appRoutes, type PageProps } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '#mocks'

import { LinkNewPage } from 'dashboard-apps-common/src/pages/LinkNewPage'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): JSX.Element {
  const skuId = props.params?.resourceId ?? ''
  const goBackUrl = `${appRoutes.details.makePath({ skuId })}?tab=links`

  const { sku, isLoading } = useSkuDetails(skuId)
  const defaultName =
    isLoading || isMockedId(sku.id) ? '' : `Link to ${sku.name}.`

  return (
    <LinkNewPage
      resourceId={skuId}
      resourceType='skus'
      goBackUrl={goBackUrl}
      defaultName={defaultName}
    />
  )
}
