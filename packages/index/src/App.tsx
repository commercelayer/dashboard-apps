import { ErrorNotFound } from '#pages/ErrorNotFound'
import { HomePage } from '#pages/HomePage'
import type { ClAppProps } from '@commercelayer/app-elements'
import { type FC } from 'react'
import { Route, Router, Switch, useLocation } from 'wouter'
import { appLazyImports } from './apps'

export const App: FC<ClAppProps> = (props) => {
  const [, setLocation] = useLocation()
  return (
    <Router>
      <Switch>
        <Route path='/' component={HomePage} />
        {Object.entries(appLazyImports).map(([slug, Component]) => {
          return (
            <Route key={slug} path={`/${slug}/*?`}>
              <Component
                {...props}
                onAppClose={() => {
                  setLocation('/')
                }}
                routerBase={`/${slug}`}
              />
            </Route>
          )
        })}
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
