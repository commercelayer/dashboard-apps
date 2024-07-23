import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { Home } from '#pages/Home'
import { StockTransferDetails } from '#pages/StockTransferDetails'
import { StockTransfersList } from '#pages/StockTransfersList'
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
        <Route path={appRoutes.list.path}>
          <StockTransfersList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.details.path}>
          <StockTransferDetails />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
