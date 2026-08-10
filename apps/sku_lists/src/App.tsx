import type { FC } from "react"
import { Redirect, Route, Router, Switch, useRoute, useSearch } from "wouter"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { LinkDetails } from "#pages/LinkDetails"
import { LinkEdit } from "#pages/LinkEdit"
import { LinkNew } from "#pages/LinkNew"
import { SkuListDetails } from "#pages/SkuListDetails"
import { SkuListDetailsAddItems } from "#pages/SkuListDetailsAddItems"
import { SkuListEdit } from "#pages/SkuListEdit"
import { SkuListNew } from "#pages/SkuListNew"
import { SkuListsList } from "#pages/SkuListsList"
import { appRoutes } from "./data/routes"

/**
 * The SKU lists list used to live at `/list`, before it became the app root. The
 * path is kept as a redirect because `useAppLinking` builds `/<appSlug>/list`
 * whenever an app links to another one without a resource id, and existing
 * bookmarks point here too. Any query string is carried over.
 */
const LegacyListRedirect: FC = () => {
  const search = useSearch()
  return <Redirect to={appRoutes.home.makePath({}, search)} replace />
}

/**
 * The list and the details drawer are rendered as siblings rather than as two
 * `Switch` branches, because `Switch` renders one branch at a time: moving
 * between `/` and `/list/:skuListId` would unmount and remount the list,
 * resetting the table every time the drawer is opened or closed.
 *
 * Keeping `<SkuListsList />` in the same position for both routes lets React
 * reuse it, so the table underneath is untouched while the drawer comes and goes.
 */
const SkuListsScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails] = useRoute(appRoutes.details.path)

  return (
    <>
      {(isList || isDetails) && <SkuListsList />}
      {isDetails && <SkuListDetails />}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.list.path}>
            <LegacyListRedirect />
          </Route>
          <Route
            path={appRoutes.detailsAddItems.path}
            component={SkuListDetailsAddItems}
          />
          <Route path={appRoutes.edit.path} component={SkuListEdit} />
          <Route path={appRoutes.new.path} component={SkuListNew} />
          <Route path={appRoutes.linksNew.path} component={LinkNew} />
          <Route path={appRoutes.linksDetails.path} component={LinkDetails} />
          <Route path={appRoutes.linksEdit.path} component={LinkEdit} />
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
      <SkuListsScreen />
    </Router>
  )
}
