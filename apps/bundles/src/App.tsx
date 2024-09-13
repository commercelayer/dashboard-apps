import { appRoutes } from '#data/routes'
import { BundleDetails } from '#pages/BundleDetails'
import { BundleEdit } from '#pages/BundleEdit'
import { BundleNew } from '#pages/BundleNew'
import { BundlesList } from '#pages/BundlesList'
import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
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
          <BundlesList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.details.path}>
          <BundleDetails />
        </Route>
        <Route path={appRoutes.edit.path}>
          <BundleEdit />
        </Route>
        <Route path={appRoutes.new.path}>
          <BundleNew />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
