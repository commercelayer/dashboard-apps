// @ts-check

/**
 * Allowed app kinds.
 * @typedef {import('@commercelayer/app-elements').TokenProviderTokenApplicationKind} AllowedAppKind
 */

/**
 * Allowed app slug.
 * @typedef {import('@commercelayer/app-elements').TokenProviderAllowedAppSlug} AllowedAppSlug
 */

/**
 * The App type.
 * @typedef {{ name: string; slug: AllowedAppSlug, kind: AllowedAppKind; icon: import('@commercelayer/app-elements').IconProps['name'] }} App
 */

/** @type {Record<string, App>} */
export const apps = {
  orders: {
    name: 'Orders',
    slug: 'orders',
    kind: 'orders',
    icon: 'shoppingBag'
  },
  shipments: {
    name: 'Shipments',
    slug: 'shipments',
    kind: 'shipments',
    icon: 'package'
  },
  customers: {
    name: 'Customers',
    slug: 'customers',
    kind: 'customers',
    icon: 'users'
  },
  returns: {
    name: 'Returns',
    slug: 'returns',
    kind: 'returns',
    icon: 'arrowUUpLeft'
  },
  stock_transfers: {
    name: 'Stock transfers',
    slug: 'stock_transfers',
    kind: 'stock_transfers',
    icon: 'arrowsLeftRight'
  },
  skus: {
    name: 'SKUs',
    slug: 'skus',
    kind: 'skus',
    icon: 'tShirt'
  },
  sku_lists: {
    name: 'SKU Lists',
    slug: 'sku_lists',
    kind: 'sku_lists',
    icon: 'clipboardText'
  },
  imports: {
    name: 'Imports',
    slug: 'imports',
    kind: 'imports',
    icon: 'download'
  },
  exports: {
    name: 'Exports',
    slug: 'exports',
    kind: 'exports',
    icon: 'upload'
  },
  webhooks: {
    name: 'Webhooks',
    slug: 'webhooks',
    kind: 'webhooks',
    icon: 'webhooksLogo'
  },
  tags: {
    name: 'Tags',
    slug: 'tags',
    kind: 'tags',
    icon: 'tag'
  },
  bundles: {
    name: 'Bundles',
    slug: 'bundles',
    kind: 'bundles',
    icon: 'shapes'
  },
  gift_cards: {
    name: 'Gift cards',
    slug: 'gift_cards',
    kind: 'gift_cards',
    icon: 'gift'
  },
  inventory: {
    name: 'Inventory',
    slug: 'inventory',
    kind: 'inventory',
    icon: 'warehouse'
  },
  price_lists: {
    name: 'Prices',
    slug: 'price_lists',
    kind: 'price_lists',
    icon: 'receipt'
  },
  promotions: {
    name: 'Promotions',
    slug: 'promotions',
    kind: 'promotions',
    icon: 'seal'
  },
  subscriptions: {
    name: 'Subscriptions',
    slug: 'subscriptions',
    kind: 'subscriptions',
    icon: 'calendarCheck'
  },
  whatever_you_want: {
    name: 'My sample app',
    slug: 'my_sample_app',
    kind: 'generic',
    icon: 'appWindow'
  }
}
