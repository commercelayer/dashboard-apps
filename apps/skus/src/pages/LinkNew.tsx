import { appRoutes, type PageProps } from '#data/routes'
import { useSkuDetails } from '#hooks/useSkuDetails'
import { isMockedId } from '@commercelayer/app-elements'

import { LinkNewPage } from 'dashboard-apps-common/src/pages/LinkNewPage'

export function LinkNew(
  props: PageProps<typeof appRoutes.linksNew>
): React.JSX.Element {
  const skuId = props.params?.resourceId ?? ''
  const goBackUrl = `${appRoutes.details.makePath({ skuId })}?tab=links`

  const { sku, isLoading } = useSkuDetails(skuId)
  const defaultName = isLoading || isMockedId(sku.id) ? '' : sku.name

  return (
    <LinkNewPage
      resourceId={skuId}
      resourceType='skus'
      goBackUrl={goBackUrl}
      defaultName={defaultName}
    />
  )
}
