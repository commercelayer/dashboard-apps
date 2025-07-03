export * from './resources/custom_promotion_rules'
export * from './resources/flex_promotions'
export * from './resources/markets'
export * from './resources/percentage_discount_promotions'
export * from './resources/price_lists'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
