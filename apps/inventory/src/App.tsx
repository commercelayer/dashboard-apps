import type { FC } from "react"
import { Redirect, Route, Router, Switch, useRoute, useSearch } from "wouter"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { StockItemDetails } from "#pages/StockItemDetails"
import { StockItemEdit } from "#pages/StockItemEdit"
import { StockItemNew } from "#pages/StockItemNew"
import { StockItemsList } from "#pages/StockItemsList"
import { appRoutes } from "./data/routes"

/**
 * The stock items list used to live at `/list` (and `/:stockLocationId/list`),
 * before it became the app root with the stock location as a filter. The path is
 * kept as a redirect because `useAppLinking` points here when linking to this app
 * without a resource id, and existing bookmarks do too.
 */
const LegacyListRedirect: FC = () => {
  const search = useSearch()
  return <Redirect to={appRoutes.home.makePath(search)} replace />
}

/**
 * The list and the details drawer are rendered as siblings rather than as two
 * `Switch` branches, because `Switch` renders one branch at a time: moving
 * between `/` and `/list/:stockItemId` would unmount and remount the list,
 * resetting the table every time the drawer is opened or closed.
 */
const InventoryScreen: FC = () => {
  const [isList] = useRoute(appRoutes.home.path)
  const [isDetails] = useRoute(appRoutes.stockItem.path)

  return (
    <>
      {(isList || isDetails) && <StockItemsList />}
      {isDetails && <StockItemDetails />}
      {!isList && !isDetails && (
        <Switch>
          <Route path={appRoutes.list.path}>
            <LegacyListRedirect />
          </Route>
          <Route path={appRoutes.newStockItem.path} component={StockItemNew} />
          <Route
            path={appRoutes.editStockItem.path}
            component={StockItemEdit}
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
      <InventoryScreen />
    </Router>
  )
}
