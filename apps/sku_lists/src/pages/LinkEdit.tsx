import { appRoutes, type PageProps } from '#data/routes'

import { LinkEditPage } from 'dashboard-apps-common/src/pages/LinkEditPage'

export function LinkEdit(
  props: PageProps<typeof appRoutes.linksEdit>
): React.JSX.Element {
  const skuListId = props.params?.resourceId ?? ''
  const linkId = props.params?.linkId ?? ''

  const goBackUrl = `${appRoutes.details.makePath({ skuListId })}?tab=links`

  return (
    <LinkEditPage
      resourceId={skuListId}
      resourceType='sku_lists'
      linkId={linkId}
      goBackUrl={goBackUrl}
    />
  )
}
