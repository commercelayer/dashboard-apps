import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { EventCallbacksList } from '#pages/EventCallbacksList'
import { WebhookCreate } from '#pages/WebhookCreate'
import { WebhookDelete } from '#pages/WebhookDelete'
import { WebhookDetails } from '#pages/WebhookDetails'
import { WebhookEdit } from '#pages/WebhookEdit'
import { WebhooksList } from '#pages/WebhooksList'
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
          <WebhooksList />
        </Route>
        <Route path={appRoutes.newWebhook.path}>
          <WebhookCreate />
        </Route>
        <Route path={appRoutes.editWebhook.path}>
          <WebhookEdit />
        </Route>
        <Route path={appRoutes.deleteWebhook.path}>
          <WebhookDelete />
        </Route>
        <Route path={appRoutes.details.path}>
          <WebhookDetails />
        </Route>
        <Route path={appRoutes.webhookEventCallbacks.path}>
          <EventCallbacksList />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
