import { createRoute, createTypedRoute } from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk'

export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute('/'),
  list: createTypedRoute<{ resourceType: ListableResourceType }>()(
    '/:resourceType/'
  ),
  details: createTypedRoute<{
    resourceType: ListableResourceType
    resourceId: string
  }>()('/:resourceType/:resourceId/')
}
