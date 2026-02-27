import { appRoutes } from '#data/routes'
import { Routes } from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Router } from 'wouter'

interface AppProps {
  routerBase?: string
}

export const App: FC<AppProps> = ({ routerBase }) => {
  return (
    <Router base={routerBase}>
      <Routes
        routes={appRoutes}
        list={{
          home: {
            component: async () => await import('#pages/Home')
          },
          list: {
            component: async () => await import('#pages/List')
          },
          details: {
            component: async () => await import('#pages/Details'),
            overlay: true
          }
        }}
      />
    </Router>
  )
}
