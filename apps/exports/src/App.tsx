import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { Router, Route, Switch } from 'wouter'
import ListPage from './pages/ListPage'
import { ResourceSelectorPage } from './pages/ResourceSelectorPage'
import DetailsPage from './pages/DetailsPage'
import NewExportPage from './pages/NewExportPage'
import { type FC } from 'react'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.list.path}>
          <ListPage />
        </Route>
        <Route path={appRoutes.selectResource.path}>
          <ResourceSelectorPage />
        </Route>
        <Route path={appRoutes.newExport.path}>
          <NewExportPage />
        </Route>
        <Route path={appRoutes.details.path}>
          <DetailsPage />
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
