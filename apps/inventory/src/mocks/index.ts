export * from './resources/skus'
export * from './resources/stockItems'
export * from './resources/stockLocations'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
