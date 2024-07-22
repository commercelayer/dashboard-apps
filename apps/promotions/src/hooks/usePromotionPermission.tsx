import type { Promotion } from '#types'
import {
  useTokenProvider,
  type TokenProviderRoleActions
} from '@commercelayer/app-elements'

export const includeAttribute = []

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePromotionPermission() {
  const { canUser } = useTokenProvider()

  return {
    canUserManagePromotions: (
      action: TokenProviderRoleActions,
      howMany: 'all' | 'atLeastOne',
      promotionTypes: Array<Promotion['type']> = [
        'buy_x_pay_y_promotions',
        'external_promotions',
        'fixed_amount_promotions',
        'fixed_price_promotions',
        'free_gift_promotions',
        'free_shipping_promotions',
        'percentage_discount_promotions'
      ]
    ) => {
      return promotionTypes.reduce((permission, promotionType) => {
        if (howMany === 'atLeastOne') {
          return permission || canUser(action, promotionType)
        }

        return permission && canUser(action, promotionType)
      }, howMany === 'all')
    }
  }
}
