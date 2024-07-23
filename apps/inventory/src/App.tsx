import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Home } from '#pages/Home'
import { StockItemDetails } from '#pages/StockItemDetails'
import { StockItemEdit } from '#pages/StockItemEdit'
import { StockItemNew } from '#pages/StockItemNew'
import { StockItemsList } from '#pages/StockItemsList'
import type { FC } from 'react'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path}>
          <Home />
        </Route>
        <Route path={appRoutes.stockLocation.path}>
          <StockItemsList />
        </Route>
        <Route path={appRoutes.stockItem.path}>
          <StockItemDetails />
        </Route>
        <Route path={appRoutes.newStockItem.path}>
          <StockItemNew />
        </Route>
        <Route path={appRoutes.editStockItem.path}>
          <StockItemEdit />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
