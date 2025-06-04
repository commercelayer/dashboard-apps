import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Route, Router, Switch } from 'wouter'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  const { canUser } = useTokenProvider()

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
            <Spacer top='14'>
              {canUser('create', 'orders') ? (
                <EmptyState
                  title="canUser('create', 'orders') ?"
                  description={
                    <>
                      You can use the helper <code>canUser()</code> to check
                      user permissions.
                      <br />
                      In this case, you can see that the user has permission to
                      create orders.
                    </>
                  }
                  action={
                    <Button variant='primary'>
                      Create an Order (not implemented)
                    </Button>
                  }
                />
              ) : canUser('read', 'orders') ? (
                <EmptyState
                  title="canUser('read', 'orders') ?"
                  description={
                    <>
                      You can use the helper <code>canUser()</code> to check
                      user permissions.
                      <br />
                      In this case, you can see that the user has permission to
                      read orders.
                    </>
                  }
                />
              ) : (
                <EmptyState
                  title="canUser('read', 'orders') ?"
                  description={
                    <>
                      You can use the helper <code>canUser()</code> to check
                      user permissions.
                      <br />
                      In this case, you can see that the user does not have
                      permission to read orders. This is the classic "Not
                      Authorized" case.
                    </>
                  }
                />
              )}
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
