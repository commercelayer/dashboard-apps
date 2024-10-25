import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { Filters } from '#pages/Filters'
import { SubscriptionsList } from '#pages/SubscriptionsList'
import type { FC } from 'react'
import { Route, Router, Switch } from 'wouter'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.list.path}>
          <SubscriptionsList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}