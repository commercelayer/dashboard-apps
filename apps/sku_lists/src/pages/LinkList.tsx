import { appRoutes, type PageProps } from '#data/routes'
import { LinksArchivePage } from 'dashboard-apps-common/src/pages/LinksArchivePage'

export const LinkList = (
  props: PageProps<typeof appRoutes.linksList>
): JSX.Element => {
  const skuListId = props.params?.resourceId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuListId })

  return (
    <LinksArchivePage
      resourceId={skuListId}
      resourceType='sku_lists'
      goBackUrl={goBackUrl}
    />
  )
}
