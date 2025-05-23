import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { EmptyState, HomePageLayout, Spacer } from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Route, Router, Switch } from 'wouter'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Switch>
        <Route path={appRoutes.home.path}>
          <HomePageLayout title='My Sample App'>
            <Spacer top='14'>
              <EmptyState
                title='Welcome'
                description='This is a starter template. Start building your application by modifying this `App.tsx` component.'
              />
            </Spacer>
          </HomePageLayout>
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
