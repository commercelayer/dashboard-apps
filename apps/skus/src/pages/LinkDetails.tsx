import { appRoutes, type PageProps } from '#data/routes'
import { LinkDetailsPage } from 'dashboard-apps-common/src/pages/LinkDetailsPage'

export const LinkDetails = (
  props: PageProps<typeof appRoutes.linksDetails>
): React.JSX.Element => {
  const skuId = props.params?.resourceId ?? ''
  const linkId = props.params?.linkId ?? ''

  const goBackUrl = `${appRoutes.details.makePath({ skuId })}?tab=links`

  return <LinkDetailsPage linkId={linkId} goBackUrl={goBackUrl} />
}
