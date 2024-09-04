import { type appRoutes, type PageProps } from '#data/routes'

import { LinkEditPage } from 'dashboard-apps-common/src/pages/LinkEditPage'

export function LinkEdit(
  props: PageProps<typeof appRoutes.linksEdit>
): JSX.Element {
  const skuListId = props.params?.resourceId ?? ''
  const linkId = props.params?.linkId ?? ''

  return (
    <LinkEditPage
      resourceId={skuListId}
      resourceType='sku_lists'
      linkId={linkId}
    />
  )
}
