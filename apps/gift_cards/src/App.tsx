import { Routes } from '#components/Routes'
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
            component: async () => await import('#pages/GiftCardList')
          },
          filters: {
            component: async () => await import('#pages/Filters')
          },
          details: {
            component: async () => await import('#pages/GiftCardDetails')
          },
          new: {
            component: async () => await import('#pages/GiftCardNew')
          },
          edit: {
            component: async () => await import('#pages/GiftCardEdit')
          }
        }}
      />
    </Router>
  )
}
