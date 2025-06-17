export * from './resources/skuListItems'
export * from './resources/skuLists'
export * from './resources/skus'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
