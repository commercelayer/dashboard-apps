import { formatResourceName } from '@commercelayer/app-elements'
import { type AllowedResourceType } from 'App'

type VisibleInUI = boolean

/**
 * To control if a resource should not be visible int the app UI
 */
const resources: Record<AllowedResourceType, VisibleInUI> = {
  addresses: true,
  bundles: true,
  coupons: true,
  customer_subscriptions: true,
  customers: true,
  gift_cards: true,
  line_items: true,
  orders: true,
  order_subscriptions: true,
  payment_methods: true,
  prices: true,
  shipments: true,
  shipping_categories: true,
  shipping_methods: true,
  sku_lists: true,
  sku_list_items: true,
  sku_options: true,
  skus: true,
  stock_items: true,
  tax_categories: true,
  transactions: true
}

/**
 * Typesafe array of AllowedResourceType
 */
const allResources = Object.keys(resources) as AllowedResourceType[]

/**
 * A resource can be set as not available in UI by modifying the above `resources` object
 * @returns an array of available resources.
 */
export const availableResources = allResources.filter((r) => resources[r])

/**
 * Simple helper to understand if a resource is available
 * @returns `true` when the resource is available, `false` otherwise
 */
export const isAvailableResource = (
  resourceType: any
): resourceType is AllowedResourceType => {
  try {
    return availableResources.includes(resourceType as AllowedResourceType)
  } catch {
    return false
  }
}

/**
 * @param resource - The resource type
 * @returns a string with the full resource name if found in `resourceNiceName` dictionary
 * Example: for `shipping_categories` resource type will return 'Shipping Categories'
 * but for `not_existing_resource` it will return 'not_existing_resource'
 */
export function showResourceNiceName(resource?: string): string {
  if (resource == null) {
    return '-'
  }

  return formatResourceName({
    resource: resource as AllowedResourceType,
    format: 'title',
    count: 'plural'
  })
}
