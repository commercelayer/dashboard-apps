import {
  type AllowedParentResource,
  type AllowedResourceType,
  type ResourceWithParent
} from 'App'

type VisibleInUI = boolean

/**
 * To control if a resource should not be visible int the app UI
 */
const resources: Record<AllowedResourceType, VisibleInUI> = {
  addresses: false,
  bundles: false,
  skus: true,
  prices: true,
  coupons: false,
  customer_payment_sources: false,
  sku_lists: false,
  sku_options: false,
  customer_subscriptions: false,
  customers: false,
  gift_cards: false,
  stock_items: true,
  tax_categories: false,
  shipping_categories: false,
  orders: false,
  line_items: false,
  tags: false,
  sku_list_items: false
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
export const isAvailableResource = (resourceType: string): boolean =>
  availableResources.includes(resourceType as AllowedResourceType)

/**
 * To control if a resource has a parent resource to be selected
 */
const resourcesWithParent: Record<ResourceWithParent, AllowedParentResource> = {
  bundles: 'markets',
  orders: 'markets',
  prices: 'price_lists',
  sku_options: 'markets',
  sku_list_items: 'sku_lists',
  stock_items: 'stock_locations',
  tax_categories: 'tax_calculators',
  // direct parent resource for `coupons` is `promotion_rules` but since they don't have a name
  // and won't be searchable for users, we allow to search from `promotions` and implicitly we then provide to
  // api the related `promotion_rules` id.
  coupons: 'promotions'
}

/**
 * Check if a resource accepts a parent resource or not
 * @param resource - The resource type
 * @returns a boolean value and when true, param will is typed as `ResourceWithParent`
 */
function hasParentResource(resource: string): resource is ResourceWithParent {
  return resource in resourcesWithParent
}

/**
 * Get the parent resource from a given resource
 * @param resource - The resource type
 * @returns a valid parent resource  or false in case the resource does not have any parent
 */
export function getParentResourceIfNeeded(
  resource: string
): AllowedParentResource | false {
  if (resource == null || !hasParentResource(resource)) {
    return false
  }
  return resourcesWithParent[resource]
}
