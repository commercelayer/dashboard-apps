export * from './resources/links'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
