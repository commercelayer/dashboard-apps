import { type AllowedResourceType } from 'App'

export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handl application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  list: {
    path: '/',
    makePath: () => '/'
  },
  selectResource: {
    path: '/new',
    makePath: () => '/new'
  },
  newImport: {
    path: '/new/:resourceType',
    makePath: (resourceType: AllowedResourceType) => `/new/${resourceType}`
  },
  details: {
    path: '/:importId',
    makePath: (importId: string) => `/${importId}`
  }
}
