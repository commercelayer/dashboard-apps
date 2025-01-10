import { Routes } from '@commercelayer/app-elements'
import { type FC } from 'react'
import { Router } from 'wouter'
import { appRoutes } from './data/routes'

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
            component: async () => await import('#pages/CustomerList')
          },
          filters: {
            component: async () => await import('#pages/Filters')
          },
          new: {
            component: async () => await import('#pages/CustomerNew'),
            overlay: true
          },
          details: {
            component: async () => await import('#pages/CustomerDetails')
          },
          edit: {
            component: async () => await import('#pages/CustomerEdit'),
            overlay: true
          },
          orders: {
            component: async () => await import('#pages/CustomerOrders')
          }
        }}
      />
    </Router>
  )
}
