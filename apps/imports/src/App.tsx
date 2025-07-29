import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { type FC } from 'react'
import { Route, Router, Switch } from 'wouter'
import DetailsPage from './pages/DetailsPage'
import Filters from './pages/Filters'
import ListPage from './pages/ListPage'
import NewImportPage from './pages/NewImportPage'
import { ResourceSelectorPage } from './pages/ResourceSelectorPage'

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
        <Route path={appRoutes.filters.path}>
          <Filters />
        </Route>
        <Route path={appRoutes.selectResource.path}>
          <ResourceSelectorPage />
        </Route>
        <Route path={appRoutes.newImport.path}>
          <NewImportPage />
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
