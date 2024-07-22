// @ts-check

/**
 * A number, or a string containing a number.
 * @typedef {Exclude<import('@commercelayer/app-elements').TokenProviderAllowedApp, 'dashboard' | 'resources'>} AllowedAppSlug
 */

/**
 * A number, or a string containing a number.
 * @typedef {{ name: string; slug: AllowedAppSlug; icon: import('@commercelayer/app-elements').IconProps['name']; repositoryName: string }} App
 */

/** @type {Record<AllowedAppSlug, App>} */
export const apps = {
  orders: {
    name: 'Orders',
    slug: 'orders',
    icon: 'shoppingBag',
    repositoryName: 'app-orders'
  },
  shipments: {
    name: 'Shipments',
    slug: 'shipments',
    icon: 'package',
    repositoryName: 'app-shipments'
  },
  customers: {
    name: 'Customers',
    slug: 'customers',
    icon: 'users',
    repositoryName: 'app-customers'
  },
  returns: {
    name: 'Returns',
    slug: 'returns',
    icon: 'arrowUUpLeft',
    repositoryName: 'app-returns'
  },
  stock_transfers: {
    name: 'Stock transfers',
    slug: 'stock_transfers',
    icon: 'arrowsLeftRight',
    repositoryName: 'app-stock-transfers'
  },
  skus: {
    name: 'SKUs',
    slug: 'skus',
    icon: 'tShirt',
    repositoryName: 'app-skus'
  },
  sku_lists: {
    name: 'SKU Lists',
    slug: 'sku_lists',
    icon: 'clipboardText',
    repositoryName: 'app-sku-lists'
  },
  imports: {
    name: 'Imports',
    slug: 'imports',
    icon: 'download',
    repositoryName: 'app-imports'
  },
  exports: {
    name: 'Exports',
    slug: 'exports',
    icon: 'upload',
    repositoryName: 'app-exports'
  },
  webhooks: {
    name: 'Webhooks',
    slug: 'webhooks',
    icon: 'webhooksLogo',
    repositoryName: 'app-webhooks'
  },
  tags: {
    name: 'Tags',
    slug: 'tags',
    icon: 'tag',
    repositoryName: 'app-tags'
  },
  bundles: {
    name: 'Bundles',
    slug: 'bundles',
    icon: 'shapes',
    repositoryName: 'app-bundles'
  },
  gift_cards: {
    name: 'Gift cards',
    slug: 'gift_cards',
    icon: 'gift',
    repositoryName: 'app-gift-cards'
  },
  inventory: {
    name: 'Inventory',
    slug: 'inventory',
    icon: 'warehouse',
    repositoryName: 'app-inventory'
  },
  price_lists: {
    name: 'Price lists',
    slug: 'price_lists',
    icon: 'receipt',
    repositoryName: 'app-price-lists'
  },
  promotions: {
    name: 'Promotions',
    slug: 'promotions',
    icon: 'seal',
    repositoryName: 'app-promotions'
  },
  subscriptions: {
    name: 'Subscriptions',
    slug: 'subscriptions',
    icon: 'calendarCheck',
    repositoryName: 'app-subscriptions'
  }
}
