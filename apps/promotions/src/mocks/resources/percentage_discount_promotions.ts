import type { Promotion } from '#types'
import { makeResource } from '../resource'

export const makePercentageDiscountPromotion = (
  overrides?: Partial<
    Extract<Promotion, { type: 'percentage_discount_promotions' }>
  >
): Extract<Promotion, { type: 'percentage_discount_promotions' }> => {
  return {
    ...makeResource(),
    type: 'percentage_discount_promotions',
    name: 'Example',
    starts_at: new Date().toJSON(),
    expires_at: new Date().toJSON(),
    total_usage_limit: 4,
    percentage: 50,
    ...overrides
  }
}
