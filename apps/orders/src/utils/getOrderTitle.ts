import type { Order } from '@commercelayer/sdk'

/**
 * Generates a standard order title suitable for the whole application (eg. `US Market #1235216`).
 * @param order - required `Order` object.
 * @returns string containing calculated order title.
 */

export const getOrderTitle = (order: Order): string => {
  const orderTitleMarket =
    order.market?.name != null ? `${order.market.name}` : 'Order'
  return `${orderTitleMarket} #${order.number}`
}
