export * from './resources/bundles'
export * from './resources/skuListItems'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
