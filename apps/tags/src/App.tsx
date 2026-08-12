import type { FC } from "react"
import { Route, Router, Switch } from "wouter"
import { ErrorNotFound } from "#pages/ErrorNotFound"
import { ListRedirect } from "#pages/ListRedirect"
import { TagEdit } from "#pages/TagEdit"
import { TagList } from "#pages/TagList"
import { TagNew } from "#pages/TagNew"
import { appRoutes } from "./data/routes"

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path}>
          <TagList />
        </Route>
        <Route path={appRoutes.list.path}>
          <ListRedirect />
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
