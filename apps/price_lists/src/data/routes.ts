import { createRoute, type GetParams } from "@commercelayer/app-elements"
import type { RouteComponentProps } from "wouter"

export type AppRoute = keyof typeof appRoutes

export type PageProps<
  Route extends {
    makePath: (...arg: any[]) => string
  },
> = RouteComponentProps<GetParams<Route>> & { overlay?: boolean }

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: createRoute("/"),
  /**
   * Legacy path of the prices list, now a redirect to `home`.
   * Kept because `useAppLinking` points here when linking to this app without a
   * resource id. Do not link to it from within the app.
   */
  pricesList: createRoute("/list/"),
  priceNew: createRoute("/new/"),
  priceDetails: createRoute("/list/:priceId/"),
  priceEdit: createRoute("/list/:priceId/edit/"),
  priceVolumeTierNew: createRoute("/list/:priceId/volume-tiers/new/"),
  priceFrequencyTierNew: createRoute("/list/:priceId/frequency-tiers/new/"),
  priceVolumeTierEdit: createRoute("/list/:priceId/volume-tiers/:tierId/edit/"),
  priceFrequencyTierEdit: createRoute(
    "/list/:priceId/frequency-tiers/:tierId/edit/",
  ),
}
