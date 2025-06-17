export * from './resources/eventCallbacks'
export * from './resources/webhooks'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
