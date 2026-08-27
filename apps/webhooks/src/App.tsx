import type { FC } from "react"
import { Route, Router, Switch } from "wouter"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { appRoutes } from "#data/routes"
import { WebhookCreate } from "#pages/WebhookCreate"
import { WebhookDetails } from "#pages/WebhookDetails"
import { WebhookEdit } from "#pages/WebhookEdit"
import { WebhooksList } from "#pages/WebhooksList"

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.list.path}>
          <WebhooksList />
        </Route>
        <Route path={appRoutes.newWebhook.path}>
          <WebhookCreate />
        </Route>
        <Route path={appRoutes.editWebhook.path}>
          <WebhookEdit />
        </Route>
        <Route path={appRoutes.details.path}>
          <WebhookDetails />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
