import { createRoute, createTypedRoute } from '@commercelayer/app-elements'
import type { PromotionType } from './promotions/config'

/**
 * Object to be used as source of truth to handel application routes
 * each page should correspond to a key and each key should have
 * a `path` property to be used as patter matching in <Route path> component
 * and `makePath` method to be used to generate the path used in navigation and links
 */
export const appRoutes = {
  /** Homepage */
  home: createRoute('/'),
  filters: createRoute('/filters/'),
  promotionList: createRoute('/list/'),
  promotionDetails: createRoute('/list/:promotionId/'),
  editPromotion: createRoute('/list/:promotionId/edit/'),
  newSelectType: createRoute('/new/'),
  newPromotion: createTypedRoute<{ promotionType: PromotionType }>()(
    '/new/:promotionType/'
  ),
  newPromotionActivationRule: createRoute(
    '/list/:promotionId/activation-rules/new/'
  ),
  couponList: createRoute('/list/:promotionId/coupons/list/'),
  newCoupon: createRoute('/list/:promotionId/coupons/new/'),
  editCoupon: createRoute('/list/:promotionId/coupons/list/:couponId/')
}
