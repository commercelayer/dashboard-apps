import { Routes } from '#components/Routes'
import { appRoutes } from '#data/routes'
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
            component: async () => await import('#pages/HomePage')
          },
          promotionList: {
            component: async () => await import('#pages/PromotionListPage')
          },
          filters: {
            component: async () => await import('#pages/FiltersPage')
          },
          promotionDetails: {
            component: async () => await import('#pages/PromotionDetailsPage')
          },
          editPromotion: {
            component: async () => await import('#pages/EditPromotionPage'),
            overlay: true
          },
          newSelectType: {
            component: async () => await import('#pages/NewSelectTypePage'),
            overlay: true
          },
          newPromotion: {
            component: async () => await import('#pages/NewPromotionPage'),
            overlay: true
          },
          newPromotionActivationRule: {
            component: async () =>
              await import('#pages/NewPromotionActivationRulePage'),
            overlay: true
          },
          couponList: {
            component: async () => await import('#pages/CouponListPage'),
            overlay: true
          },
          newCoupon: {
            component: async () => await import('#pages/NewCouponPage'),
            overlay: true
          },
          editCoupon: {
            component: async () => await import('#pages/EditCouponPage'),
            overlay: true
          }
        }}
      />
    </Router>
  )
}
