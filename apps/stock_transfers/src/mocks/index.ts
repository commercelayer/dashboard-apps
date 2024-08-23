import type { Resource } from '@commercelayer/sdk'

export * from './resources/customers'
export * from './resources/line_items'
export * from './resources/markets'
export * from './resources/orders'
export * from './resources/shipments'
export * from './resources/stock_transfers'

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
