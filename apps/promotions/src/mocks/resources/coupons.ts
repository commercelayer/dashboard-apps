import type { Coupon } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeCoupon = (overrides?: Partial<Coupon>): Coupon => {
  return {
    ...makeResource(),
    type: 'coupons',
    code: 'WELCOME-100',
    expires_at: new Date().toJSON(),
    usage_count: 4,
    ...overrides
  }
}
