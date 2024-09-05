import { type appRoutes, type PageProps } from '#data/routes'
import { LinkDetailsPage } from 'dashboard-apps-common/src/pages/LinkDetailsPage'

export const LinkDetails = (
  props: PageProps<typeof appRoutes.linksDetails>
): JSX.Element => {
  const skuId = props.params?.resourceId ?? ''
  const linkId = props.params?.linkId ?? ''

  return <LinkDetailsPage resourceId={skuId} linkId={linkId} />
}
