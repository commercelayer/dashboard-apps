export * from './resources/orders'
export * from './resources/orderSubscriptionItems'
export * from './resources/orderSubscriptions'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
