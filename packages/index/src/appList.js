// @ts-check

/**
 * A number, or a string containing a number.
 * @typedef {Exclude<import('@commercelayer/app-elements').TokenProviderAllowedApp, 'dashboard' | 'resources'>} AllowedAppSlug
 */

/**
 * A number, or a string containing a number.
 * @typedef {{ name: string; slug: AllowedAppSlug; icon: import('@commercelayer/app-elements').IconProps['name'] }} App
 */

/** @type {Record<AllowedAppSlug, App>} */
export const apps = {
  orders: {
    name: 'Orders',
    slug: 'orders',
    icon: 'shoppingBag'
  },
  shipments: {
    name: 'Shipments',
    slug: 'shipments',
    icon: 'package'
  },
  customers: {
    name: 'Customers',
    slug: 'customers',
    icon: 'users'
  },
  returns: {
    name: 'Returns',
    slug: 'returns',
    icon: 'arrowUUpLeft'
  },
  stock_transfers: {
    name: 'Stock transfers',
    slug: 'stock_transfers',
    icon: 'arrowsLeftRight'
  },
  skus: {
    name: 'SKUs',
    slug: 'skus',
    icon: 'tShirt'
  },
  sku_lists: {
    name: 'SKU Lists',
    slug: 'sku_lists',
    icon: 'clipboardText'
  },
  imports: {
    name: 'Imports',
    slug: 'imports',
    icon: 'download'
  },
  exports: {
    name: 'Exports',
    slug: 'exports',
    icon: 'upload'
  },
  webhooks: {
    name: 'Webhooks',
    slug: 'webhooks',
    icon: 'webhooksLogo'
  },
  tags: {
    name: 'Tags',
    slug: 'tags',
    icon: 'tag'
  },
  bundles: {
    name: 'Bundles',
    slug: 'bundles',
    icon: 'shapes'
  },
  gift_cards: {
    name: 'Gift cards',
    slug: 'gift_cards',
    icon: 'gift'
  },
  inventory: {
    name: 'Inventory',
    slug: 'inventory',
    icon: 'warehouse'
  },
  price_lists: {
    name: 'Price lists',
    slug: 'price_lists',
    icon: 'receipt'
  },
  promotions: {
    name: 'Promotions',
    slug: 'promotions',
    icon: 'seal'
  },
  subscriptions: {
    name: 'Subscriptions',
    slug: 'subscriptions',
    icon: 'calendarCheck'
  }
}
