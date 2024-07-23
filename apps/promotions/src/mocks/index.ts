import type { Resource } from '@commercelayer/sdk'

export * from './resources/custom_promotion_rules'
export * from './resources/markets'
export * from './resources/percentage_discount_promotions'
export * from './resources/price_lists'

export const isMockedId = (id: string): boolean => {
  return id.startsWith('fake-')
}

export const isMock = (resource: Resource): boolean => {
  return isMockedId(resource.id)
}

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
