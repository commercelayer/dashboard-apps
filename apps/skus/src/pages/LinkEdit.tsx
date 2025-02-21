import { appRoutes, type PageProps } from '#data/routes'

import { LinkEditPage } from 'dashboard-apps-common/src/pages/LinkEditPage'

export function LinkEdit(
  props: PageProps<typeof appRoutes.linksEdit>
): React.JSX.Element {
  const skuId = props.params?.resourceId ?? ''
  const linkId = props.params?.linkId ?? ''

  const goBackUrl = `${appRoutes.details.makePath({ skuId })}?tab=links`

  return (
    <LinkEditPage
      resourceId={skuId}
      resourceType='skus'
      linkId={linkId}
      goBackUrl={goBackUrl}
    />
  )
}
