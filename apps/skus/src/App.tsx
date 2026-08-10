import type { FC } from "react"
import { Redirect, Route, Router, Switch, useRoute, useSearch } from "wouter"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { LinkDetails } from "#pages/LinkDetails"
import { LinkEdit } from "#pages/LinkEdit"
import { LinkNew } from "#pages/LinkNew"
import { SkuDetails } from "#pages/SkuDetails"
import { SkuEdit } from "#pages/SkuEdit"
import { SkuNew } from "#pages/SkuNew"
import { SkusList } from "#pages/SkusList"
import { appRoutes } from "./data/routes"

/**
 * The SKUs list used to live at `/list`, before it became the app root. The path
 * is kept as a redirect because `useAppLinking` builds `/<appSlug>/list` whenever
 * an app links to another one without a resource id, and existing bookmarks point
 * here too. Any query string is carried over, so a filtered link keeps working.
 */
const LegacyListRedirect: FC = () => {
  const search = useSearch()
  return <Redirect to={appRoutes.home.makePath({}, search)} replace />
}

interface AppProps {
  routerBase?: string
}

/**
 * The list and the details drawer are rendered as siblings rather than as two
 * `Switch` branches, because `Switch` renders one branch at a time: moving
 * between `/` and `/list/:skuId` would unmount and remount the list, resetting
 * the table (page, sorting) every time the drawer is opened or closed.
 *
 * Keeping `<SkusList />` in the same position for both routes lets React reuse
 * it, so the table underneath is untouched while the drawer comes and goes.
 */
const SkusScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails] = useRoute(appRoutes.details.path)

  return (
    <>
      {(isList || isDetails) && <SkusList />}
      {isDetails && <SkuDetails />}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.list.path}>
            <LegacyListRedirect />
          </Route>
          <Route path={appRoutes.edit.path} component={SkuEdit} />
          <Route path={appRoutes.new.path} component={SkuNew} />
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

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <SkusScreen />
    </Router>
  )
}
