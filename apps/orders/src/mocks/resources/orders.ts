import { repeat } from '#mocks'
import type { Order } from '@commercelayer/sdk'
import { makeResource } from '../resource'

import { makeCustomer } from './customers'
import { makeLineItem } from './line_items'
import { makeMarket } from './markets'
import { makeShipment } from './shipments'

export const makeOrder = (): Order => {
  return {
    ...makeResource('orders'),
    status: 'draft',
    payment_status: 'unpaid',
    fulfillment_status: 'unfulfilled',
    line_items: repeat(1, () => makeLineItem()),
    market: makeMarket(),
    customer: makeCustomer(),
    shipments: repeat(1, () => makeShipment()),

    subtotal_amount_cents: 14160,
    formatted_subtotal_amount: '$141.60',
    discount_amount_cents: 0,
    formatted_discount_amount: '$0.00',
    adjustment_amount_cents: 0,
    formatted_adjustment_amount: '$0.00',
    shipping_amount_cents: 1200,
    formatted_shipping_amount: '$12.00',
    payment_method_amount_cents: 1000,
    formatted_payment_method_amount: '$10.00',
    total_tax_amount_cents: 3115,
    formatted_total_tax_amount: '$31.15',
    gift_card_amount_cents: 0,
    formatted_gift_card_amount: '$0.00',
    total_amount_cents: 16360,
    formatted_total_amount: '$163.60'
  }
}
