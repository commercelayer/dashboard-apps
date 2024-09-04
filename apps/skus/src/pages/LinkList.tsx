import { appRoutes, type PageProps } from '#data/routes'
import { LinksArchivePage } from 'dashboard-apps-common/src/pages/LinksArchivePage'

export const LinkList = (
  props: PageProps<typeof appRoutes.linksList>
): JSX.Element => {
  const skuId = props.params?.resourceId ?? ''
  const goBackUrl = appRoutes.details.makePath({ skuId })

  return (
    <LinksArchivePage
      resourceId={skuId}
      resourceType='skus'
      goBackUrl={goBackUrl}
    />
  )
}
