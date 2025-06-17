export * from './resources/customers'
export * from './resources/line_items'
export * from './resources/markets'
export * from './resources/orders'
export * from './resources/return_line_items'
export * from './resources/returns'
export * from './resources/shipments'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
