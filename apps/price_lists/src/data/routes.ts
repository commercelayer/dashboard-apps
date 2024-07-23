import { createRoute, type GetParams } from '@commercelayer/app-elements'
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
  priceListNew: createRoute('/new/'),
  priceListEdit: createRoute('/:priceListId/edit/'),
  pricesList: createRoute('/:priceListId/list/'),
  priceNew: createRoute('/:priceListId/list/new/'),
  priceDetails: createRoute('/:priceListId/list/:priceId/'),
  priceEdit: createRoute('/:priceListId/list/:priceId/edit/'),
  priceVolumeTierNew: createRoute(
    '/:priceListId/list/:priceId/volume-tiers/new/'
  ),
  priceFrequencyTierNew: createRoute(
    '/:priceListId/list/:priceId/frequency-tiers/new/'
  ),
  priceVolumeTierEdit: createRoute(
    '/:priceListId/list/:priceId/volume-tiers/:tierId/edit/'
  ),
  priceFrequencyTierEdit: createRoute(
    '/:priceListId/list/:priceId/frequency-tiers/:tierId/edit/'
  )
}
