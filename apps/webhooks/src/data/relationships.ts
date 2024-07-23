import type { ResourceEventKey } from '#data/events'
import type { InputSelectValue } from '@commercelayer/app-elements'
import type { ResourceWithRelationship } from 'App'

export const webhookRelationships: Record<ResourceWithRelationship, string[]> =
  {
    bundles: ['sku_list', 'sku_list_items'],
    customer_subscriptions: ['customer'],
    customers: ['customer_subscriptions'],
    orders: [
      'customer',
      'shipping_address',
      'billing_address',
      'payment_method',
      'line_items.line_item_options',
      'shipments.shipping_method',
      'authorizations',
      'captures',
      'voids',
      'refunds',
      'transactions'
    ],
    payment_methods: ['order'],
    prices: ['sku', 'price_tiers'],
    shipments: ['order', 'shipping_category', 'shipping_method'],
    shipping_categories: ['skus'],
    shipping_methods: ['shipments'],
    skus: [
      'shipping_category',
      'prices.price_tiers',
      'stock_items',
      'tax_categories'
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
  return webhookRelationships[resourceType]
}

function getDottedIncludeRelationships(
  selectedResourceEvent?: ResourceEventKey
): string[] {
  const allDottedRelationships: string[] = []
  Object.keys(webhookRelationships).forEach((res) => {
    const selectedResource = selectedResourceEvent?.split('.')[0]
    const relationships = getRelationshipsByResourceType(
      res as ResourceWithRelationship
    )
    relationships.forEach((rel) => {
      if (selectedResource == null || res === selectedResource) {
        allDottedRelationships.push(`${res}.${rel}`)
      }
    })
  })
  return allDottedRelationships
}

const allDottedRelationships = getDottedIncludeRelationships()
export type ResourceRelationshipKey = (typeof allDottedRelationships)[number]

export function getAllRelationshipsForSelect(
  parentResource?: ResourceEventKey
): InputSelectValue[] {
  const allRelationshipsForSelect: InputSelectValue[] = []
  const dottedRelationships = getDottedIncludeRelationships(parentResource)
  dottedRelationships.forEach((rel) => {
    allRelationshipsForSelect.push({
      label: rel,
      value: rel
    })
  })
  return allRelationshipsForSelect
}

export function isResourceWithRelationship(
  resourceType: any
): resourceType is ResourceWithRelationship {
  try {
    return (
      resourceType in webhookRelationships &&
      getRelationshipsByResourceType(resourceType as ResourceWithRelationship)
        .length > 0
    )
  } catch {
    return false
  }
}
