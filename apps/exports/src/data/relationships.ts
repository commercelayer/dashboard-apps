import { type ResourceWithRelationship } from 'App'

export const exportRelationships: Record<ResourceWithRelationship, string[]> = {
  bundles: ['sku_list', 'sku_list_items', 'tags'],
  customer_subscriptions: ['customer'],
  customers: ['customer_subscriptions', 'tags'],
  orders: [
    'customer',
    'shipping_address',
    'billing_address',
    'payment_method',
    'line_items',
    'line_items.line_item_options',
    'shipments',
    'shipments.shipping_method',
    'authorizations',
    'captures',
    'voids',
    'refunds',
    'transactions',
    'tags'
  ],
  order_subscriptions: [
    'customer',
    'customer_payment_source',
    'source_order',
    'order_subscription_items'
  ],
  payment_methods: ['order'],
  prices: ['sku', 'price_tiers'],
  shipments: ['order', 'shipping_category', 'shipping_method', 'tags'],
  shipping_categories: ['skus'],
  shipping_methods: ['shipments'],
  skus: [
    'shipping_category',
    'prices',
    'prices.price_tiers',
    'stock_items',
    'tax_categories',
    'tags'
  ],
  sku_lists: ['sku_list_items', 'bundles'],
  sku_list_items: ['sku'],
  stock_items: ['sku'],
  tax_categories: ['sku'],
  transactions: ['order']
}

export function getRelationshipsByResourceType(
  resourceType: ResourceWithRelationship
): string[] {
  return exportRelationships[resourceType]
}

export function isResourceWithRelationship(
  resourceType: any
): resourceType is ResourceWithRelationship {
  try {
    return (
      resourceType in exportRelationships &&
      getRelationshipsByResourceType(resourceType as ResourceWithRelationship)
        .length > 0
    )
  } catch {
    return false
  }
}
