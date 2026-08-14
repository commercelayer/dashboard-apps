import type { FC } from "react"
import { Route, Router, Switch, useRoute } from "wouter"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { appRoutes } from "#data/routes"
import DetailsPage from "./pages/DetailsPage"
import ListPage from "./pages/ListPage"
import NewExportPage from "./pages/NewExportPage"
import { ResourceSelectorPage } from "./pages/ResourceSelectorPage"

interface AppProps {
  routerBase?: string
}

/**
 * The list stays mounted while the details drawer is open, so opening an export
 * costs no refetch and closing it reveals the list as it was. `Switch` would
 * render only one of them, hence the two conditions rather than routes.
 *
 * `details` is `/:exportId`, which also matches `/new`, so the more specific
 * routes are checked first.
 */
const ExportsScreen: FC = () => {
  const [isList] = useRoute(appRoutes.list.path)
  const [isSelectResource] = useRoute(appRoutes.selectResource.path)
  const [isNewExport] = useRoute(appRoutes.newExport.path)
  const [isDetails] = useRoute(appRoutes.details.path)

  const isDetailsDrawer = isDetails && !isSelectResource && !isNewExport

  if (isSelectResource || isNewExport) {
    return (
      <Switch>
        <Route path={appRoutes.selectResource.path}>
          <ResourceSelectorPage />
        </Route>
        <Route path={appRoutes.newExport.path}>
          <NewExportPage />
        </Route>
      </Switch>
    )
  }

  if (!isList && !isDetailsDrawer) {
    return <ErrorNotFound />
  }

  return (
    <>
      <ListPage />
      {isDetailsDrawer && <DetailsPage />}
    </>
  )
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <ExportsScreen />
    </Router>
  )
}
