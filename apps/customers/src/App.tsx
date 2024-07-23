import { CustomerDetails } from '#pages/CustomerDetails'
import { CustomerEdit } from '#pages/CustomerEdit'
import { CustomerList } from '#pages/CustomerList'
import { CustomerNew } from '#pages/CustomerNew'
import { CustomerOrders } from '#pages/CustomerOrders'
import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import type { FC } from 'react'
import { Redirect, Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path}>
          <Redirect to={appRoutes.list.path} />
        </Route>
        <Route path={appRoutes.list.path}>
          <CustomerList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.new.path}>
          <CustomerNew />
        </Route>
        <Route path={appRoutes.details.path}>
          <CustomerDetails />
        </Route>
        <Route path={appRoutes.edit.path}>
          <CustomerEdit />
        </Route>
        <Route path={appRoutes.orders.path}>
          <CustomerOrders />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
