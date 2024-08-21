import { ErrorNotFound } from '#pages/ErrorNotFound'
import { LinkDetails } from '#pages/LinkDetails'
import { LinkEdit } from '#pages/LinkEdit'
import { LinkList } from '#pages/LinkList'
import { LinkNew } from '#pages/LinkNew'
import { SkuListDetails } from '#pages/SkuListDetails'
import { SkuListEdit } from '#pages/SkuListEdit'
import { SkuListNew } from '#pages/SkuListNew'
import { SkuListsList } from '#pages/SkuListsList'
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
        <Route path={appRoutes.list.path} component={SkuListsList} />
        <Route path={appRoutes.details.path} component={SkuListDetails} />
        <Route path={appRoutes.edit.path} component={SkuListEdit} />
        <Route path={appRoutes.new.path} component={SkuListNew} />
        <Route path={appRoutes.linksList.path} component={LinkList} />
        <Route path={appRoutes.linksNew.path} component={LinkNew} />
        <Route path={appRoutes.linksDetails.path} component={LinkDetails} />
        <Route path={appRoutes.linksEdit.path} component={LinkEdit} />
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
