import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { Filters } from '#pages/Filters'
import SubscriptionDetails from '#pages/SubscriptionDetails'
import { SubscriptionEdit } from '#pages/SubscriptionEdit'
import { SubscriptionOrders } from '#pages/SubscriptionOrders'
import { SubscriptionsList } from '#pages/SubscriptionsList'
import type { FC } from 'react'
import { Redirect, Route, Router, Switch } from 'wouter'

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
          <SubscriptionsList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.details.path}>
          <SubscriptionDetails />
        </Route>
        <Route path={appRoutes.orders.path}>
          <SubscriptionOrders />
        </Route>
        <Route path={appRoutes.edit.path}>
          <SubscriptionEdit />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
