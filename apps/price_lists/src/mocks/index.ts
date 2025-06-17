export * from './resources/priceLists'
export * from './resources/prices'
export * from './resources/priceTiers'
export * from './resources/skus'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
