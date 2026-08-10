import type { FC } from "react"
import { Redirect, Route, Router, Switch, useRoute, useSearch } from "wouter"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { PriceDetails } from "#pages/PriceDetails"
import { PriceEdit } from "#pages/PriceEdit"
import { PriceNew } from "#pages/PriceNew"
import { PricesList } from "#pages/PricesList"
import { PriceTierEdit } from "#pages/PriceTierEdit"
import { PriceTierNew } from "#pages/PriceTierNew"
import { appRoutes } from "./data/routes"

/**
 * The prices list used to live at `/:priceListId?/list`, before it became the app
 * root with the price list as a filter. The path is kept as a redirect because
 * `useAppLinking` builds `/<appSlug>/list` whenever an app links to another one
 * without a resource id, and existing bookmarks point here too.
 */
const LegacyListRedirect: FC = () => {
  const search = useSearch()
  return <Redirect to={appRoutes.home.makePath({}, search)} replace />
}

/**
 * The list and the details drawer are rendered as siblings rather than as two
 * `Switch` branches, because `Switch` renders one branch at a time: moving
 * between `/` and `/list/:priceId` would unmount and remount the list, resetting
 * the table every time the drawer is opened or closed.
 */
const PricesScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails] = useRoute(appRoutes.priceDetails.path)

  return (
    <>
      {(isList || isDetails) && <PricesList />}
      {isDetails && <PriceDetails />}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.pricesList.path}>
            <LegacyListRedirect />
          </Route>
          <Route path={appRoutes.priceNew.path} component={PriceNew} />
          <Route path={appRoutes.priceEdit.path} component={PriceEdit} />
          <Route
            path={appRoutes.priceFrequencyTierEdit.path}
            component={PriceTierEdit}
          />
          <Route
            path={appRoutes.priceFrequencyTierNew.path}
            component={PriceTierNew}
          />
          <Route
            path={appRoutes.priceVolumeTierEdit.path}
            component={PriceTierEdit}
          />
          <Route
            path={appRoutes.priceVolumeTierNew.path}
            component={PriceTierNew}
          />
          <Route>
            <ErrorNotFound />
          </Route>
        </Switch>
      )}
    </>
  )
}

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <PricesScreen />
    </Router>
  )
}
