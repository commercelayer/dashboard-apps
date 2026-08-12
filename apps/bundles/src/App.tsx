import type { FC } from "react"
import { Route, Router, Switch, useRoute } from "wouter"
import { appRoutes } from "#data/routes"
import { BundleDetails } from "#pages/BundleDetails"
import { BundleEdit } from "#pages/BundleEdit"
import { BundleNew } from "#pages/BundleNew"
import { BundlesList } from "#pages/BundlesList"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { ListRedirect } from "#pages/ListRedirect"

interface AppProps {
  routerBase?: string
}

/**
 * The list stays mounted while the details drawer is open, so opening a bundle
 * costs no refetch and closing it reveals the list as it was. `Switch` would
 * render only one of them, hence the two conditions rather than routes.
 */
const BundlesScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails] = useRoute(appRoutes.details.path)

  return (
    <>
      {(isList || isDetails) && <BundlesList />}
      {isDetails && <BundleDetails />}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.list.path}>
            <ListRedirect />
          </Route>
          <Route path={appRoutes.edit.path}>
            <BundleEdit />
          </Route>
          <Route path={appRoutes.new.path}>
            <BundleNew />
          </Route>
          <Route>
            <ErrorNotFound />
          </Route>
        </Switch>
      )}
    </>
  )
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <BundlesScreen />
    </Router>
  )
}
