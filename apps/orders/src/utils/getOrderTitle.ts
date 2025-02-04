import { t } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

/**
 * Generates a standard order title suitable for the whole application (eg. `US Market #1235216`).
 * @param order - required `Order` object.
 * @returns string containing calculated order title.
 */

export const getOrderTitle = (
  order: Order,
  options: { hideMarket: boolean } | undefined
): string => {
  const orderTitleMarket =
    order.market?.name != null
      ? `${order.market.name}`
      : t('resources.orders.name')

  return options?.hideMarket === true
    ? `#${order.number}`
    : `${orderTitleMarket} #${order.number}`
}
