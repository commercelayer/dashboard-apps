import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { Home } from '#pages/Home'
import { RestockReturn } from '#pages/RestockReturn'
import { ReturnDetails } from '#pages/ReturnDetails'
import { ReturnsList } from '#pages/ReturnsList'
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
          <ReturnsList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.details.path}>
          <ReturnDetails />
        </Route>
        <Route path={appRoutes.restock.path}>
          <RestockReturn />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
