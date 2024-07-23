import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { Home } from '#pages/Home'
import { Packing } from '#pages/Packing'
import { Purchase } from '#pages/Purchase'
import { ShipmentDetails } from '#pages/ShipmentDetails'
import { ShipmentList } from '#pages/ShipmentList'
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
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.list.path}>
          <ShipmentList />
        </Route>
        <Route path={appRoutes.details.path}>
          <ShipmentDetails />
        </Route>
        <Route path={appRoutes.packing.path}>
          <Packing />
        </Route>
        <Route path={appRoutes.purchase.path}>
          <Purchase />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
