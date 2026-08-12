import type { FC } from "react"
import { Route, Router, Switch } from "wouter"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { appRoutes } from "#data/routes"
import { ListRedirect } from "#pages/ListRedirect"
import SubscriptionDetails from "#pages/SubscriptionDetails"
import { SubscriptionEdit } from "#pages/SubscriptionEdit"
import { SubscriptionOrders } from "#pages/SubscriptionOrders"
import { SubscriptionsList } from "#pages/SubscriptionsList"

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path}>
          <SubscriptionsList />
        </Route>
        <Route path={appRoutes.list.path}>
          <ListRedirect />
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
