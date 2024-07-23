import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { SkuDetails } from '#pages/SkuDetails'
import { SkuEdit } from '#pages/SkuEdit'
import { SkuNew } from '#pages/SkuNew'
import { SkusList } from '#pages/SkusList'
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
          <SkusList />
        </Route>
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.details.path}>
          <SkuDetails />
        </Route>
        <Route path={appRoutes.edit.path}>
          <SkuEdit />
        </Route>
        <Route path={appRoutes.new.path}>
          <SkuNew />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
