import {
  createRoute,
  createTypedRoute,
  type GetParams
} from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'
import { linksRoutes } from 'dashboard-apps-common/src/data/routes'
import type { RouteComponentProps } from 'wouter'

export type AppRoute = keyof typeof appRoutes

export type PageProps<
  Route extends {
    makePath: (...arg: any[]) => string
  }
> = RouteComponentProps<GetParams<Route>> & { overlay?: boolean }

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute('/'),
  list: createRoute('/list/'),
  new: createRoute('/new/'),
  details: createTypedRoute<{ skuListId: SkuList['id'] }>()(
    '/list/:skuListId/'
  ),
  detailsAddItems: createTypedRoute<{ skuListId: SkuList['id'] }>()(
    '/list/:skuListId/add-items/'
  ),
  edit: createTypedRoute<{ skuListId: SkuList['id'] }>()(
    '/list/:skuListId/edit/'
  ),
  ...linksRoutes
}
