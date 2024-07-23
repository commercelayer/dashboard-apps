import type { InputSelectValue } from '@commercelayer/app-elements'
import type { ResourceWithEvent } from 'App'

export const webhookEvents: Record<ResourceWithEvent, string[]> = {
  addresses: ['tagged'],
  authorizations: ['create', 'failed', 'succeeded'],
  bundles: ['tagged'],
  buy_x_pay_y_promotions: ['create', 'destroy', 'tagged'],
  captures: ['create', 'failed', 'succeeded'],
  cleanups: ['complete', 'create', 'destroy', 'interrupt', 'start'],
  coupons: ['tagged'],
  customer_addresses: ['create', 'destroy'],
  customer_password_resets: ['create', 'destroy', 'reset_password'],
  customer_subscriptions: ['create', 'destroy'],
  customers: [
    'acquired',
    'create',
    'create_password',
    'destroy',
    'metadata_update',
    'repeat',
    'tagged'
  ],
  exports: ['complete', 'create', 'destroy', 'interrupt', 'start'],
  external_promotions: ['create', 'destroy', 'tagged'],
  fixed_amount_promotions: ['create', 'destroy', 'tagged'],
  fixed_price_promotions: ['create', 'destroy', 'tagged'],
  free_gift_promotions: ['create', 'destroy', 'tagged'],
  free_shipping_promotions: ['create', 'destroy', 'tagged'],
  gift_cards: [
    'activate',
    'create',
    'deactivate',
    'destroy',
    'purchase',
    'redeem',
    'tagged',
    'use'
  ],
  imports: ['complete', 'create', 'destroy', 'interrupt', 'start'],
  in_stock_subscriptions: [
    'activate',
    'create',
    'deactivate',
    'destroy',
    'notify'
  ],
  line_items: ['tagged'],
  line_item_options: ['tagged'],
  orders: [
    'approve',
    'authorize',
    'cancel',
    'cancel_fulfilling',
    'cancel_subscriptions',
    'create',
    'create_subscriptions',
    'destroy',
    'draft',
    'fulfill',
    'pay',
    'pending',
    'place',
    'placing',
    'rebuild_shipments',
    'refund',
    'start_editing',
    'start_fulfilling',
    'stop_editing',
    'tagged',
    'void'
  ],
  order_copies: ['complete', 'create', 'destroy', 'fail', 'start'],
  order_subscriptions: [
    'activate',
    'cancel',
    'create',
    'deactivate',
    'destroy',
    'last_run_failed',
    'last_run_succeeded',
    'renewal'
  ],
  parcels: [
    'available_for_pickup',
    'booked',
    'cancelled',
    'create',
    'delivered',
    'destroy',
    'failure',
    'in_transit',
    'out_for_delivery',
    'pre_transit',
    'return_to_sender',
    'shipped'
  ],
  percentage_discount_promotions: ['create', 'destroy', 'tagged'],
  price_frequency_tiers: ['create', 'destroy'],
  price_volume_tiers: ['create', 'destroy'],
  promotions: ['create', 'destroy', 'tagged'],
  recurring_order_copies: ['complete', 'create', 'destroy', 'fail', 'start'],
  refunds: ['create', 'failed', 'succeeded'],
  returns: [
    'approve',
    'create',
    'destroy',
    'pending',
    'receive',
    'reject',
    'request',
    'restock',
    'ship',
    'tagged'
  ],
  shipments: [
    'cancel',
    'on_hold',
    'packing',
    'picking',
    'ready_to_ship',
    'ship',
    'tagged',
    'upcoming'
  ],
  shipping_weight_tiers: ['create', 'destroy'],
  skus: ['tagged'],
  sku_options: ['tagged'],
  stock_transfers: [
    'cancel',
    'complete',
    'create',
    'destroy',
    'in_transit',
    'on_hold',
    'picking',
    'upcoming'
  ],
  transaction: ['create'],
  voids: ['create', 'failed', 'succeeded']
}

export function getEventsByResourceType(
  resourceType: ResourceWithEvent
): string[] {
  return webhookEvents[resourceType]
}

function getAllFlatEvents(): string[] {
  const allFlatEvents: string[] = []
  Object.keys(webhookEvents).forEach((res) => {
    const relationships = getEventsByResourceType(res as ResourceWithEvent)
    relationships.forEach((rel) => {
      allFlatEvents.push(`${res}.${rel}`)
    })
  })
  return allFlatEvents
}

const allFlatEvents = getAllFlatEvents()
export type ResourceEventKey = (typeof allFlatEvents)[number]

export function getAllEventsForSelect(): InputSelectValue[] {
  const allEventsForSelect: InputSelectValue[] = []
  allFlatEvents.sort()
  allFlatEvents.forEach((event) => {
    allEventsForSelect.push({
      label: event,
      value: event
    })
  })

  return allEventsForSelect
}

export function isResourceWithEvent(
  resourceType: any
): resourceType is ResourceWithEvent {
  try {
    return (
      resourceType in webhookEvents &&
      getEventsByResourceType(resourceType as ResourceWithEvent).length > 0
    )
  } catch {
    return false
  }
}
