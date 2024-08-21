import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { LinkDetails } from '#pages/LinkDetails'
import { LinkEdit } from '#pages/LinkEdit'
import { LinkList } from '#pages/LinkList'
import { LinkNew } from '#pages/LinkNew'
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
        <Route path={appRoutes.list.path} component={SkusList} />
        <Route path={appRoutes.filters.path} component={Filters} />
        <Route path={appRoutes.details.path} component={SkuDetails} />
        <Route path={appRoutes.edit.path} component={SkuEdit} />
        <Route path={appRoutes.new.path} component={SkuNew} />
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
