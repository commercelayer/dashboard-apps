import { ErrorNotFound } from '#pages/ErrorNotFound'
import { TagEdit } from '#pages/TagEdit'
import { TagList } from '#pages/TagList'
import { TagNew } from '#pages/TagNew'
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
          <TagList />
        </Route>
        <Route path={appRoutes.new.path}>
          <TagNew />
        </Route>
        <Route path={appRoutes.edit.path}>
          <TagEdit />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
