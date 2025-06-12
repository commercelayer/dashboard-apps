import type { Promotion } from '#types'
import { makeResource } from '../resource'

export const makeFlexPromotion = (
  overrides?: Partial<Extract<Promotion, { type: 'flex_promotions' }>>
): Extract<Promotion, { type: 'flex_promotions' }> => {
  return {
    ...makeResource(),
    type: 'flex_promotions',
    name: 'Example',
    starts_at: new Date().toJSON(),
    expires_at: new Date().toJSON(),
    rules: {
      rules: [
        {
          name: 'Rule name',
          actions: [null],
          conditions: [null]
        }
      ]
    },
    ...overrides
  }
}
