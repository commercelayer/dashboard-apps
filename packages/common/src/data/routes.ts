import { createTypedRoute } from '@commercelayer/app-elements'
import type { Link, Resource } from '@commercelayer/sdk'

export const linksRoutes = {
  linksNew: createTypedRoute<{ resourceId: Resource['id'] }>()(
    '/list/:resourceId/links/new/'
  ),
  linksDetails: createTypedRoute<{
    resourceId: Resource['id']
    linkId: Link['id']
  }>()('/list/:resourceId/links/:linkId/'),
  linksEdit: createTypedRoute<{
    resourceId: Resource['id']
    linkId: Link['id']
  }>()('/list/:resourceId/links/:linkId/edit/')
}
