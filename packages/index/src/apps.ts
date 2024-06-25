import type {
  ClAppProps,
  IconProps,
  TokenProviderAllowedApp
} from '@commercelayer/app-elements'
import { lazy, type FC, type LazyExoticComponent } from 'react'

export type AllowedAppSlug = Exclude<
  TokenProviderAllowedApp,
  'dashboard' | 'resources'
>

type ReplaceAll<
  Text extends string,
  SearchValue extends string,
  ReplaceValue extends string
> = Text extends `${infer H}${SearchValue}${infer T}`
  ? ReplaceAll<`${H}${ReplaceValue}${T}`, SearchValue, ReplaceValue>
  : Text

type AppFolderName = ReplaceAll<AllowedAppSlug, '_', '-'>

export interface App {
  /** Name to be shown in the list */
  name: string
  /** App slug to match the api_credential kind */
  slug: AllowedAppSlug
  /** App icon for the list */
  icon: IconProps['name']
  /** Slug to identify repository name (eg: app-order or app-sku-lists) */
  // https://github.com/commercelayer/app-stock-transfers/
  repositoryName: string
  /** Package folder name */
  packageName: AppFolderName
}

export const apps: Record<AllowedAppSlug, App> = {
  orders: {
    name: 'Orders',
    slug: 'orders',
    icon: 'shoppingBag',
    repositoryName: 'app-orders',
    packageName: 'orders'
  },
  shipments: {
    name: 'Shipments',
    slug: 'shipments',
    icon: 'package',
    repositoryName: 'app-shipments',
    packageName: 'shipments'
  },
  customers: {
    name: 'Customers',
    slug: 'customers',
    icon: 'users',
    repositoryName: 'app-customers',
    packageName: 'customers'
  },
  returns: {
    name: 'Returns',
    slug: 'returns',
    icon: 'arrowUUpLeft',
    repositoryName: 'app-returns',
    packageName: 'returns'
  },
  stock_transfers: {
    name: 'Stock transfers',
    slug: 'stock_transfers',
    icon: 'arrowsLeftRight',
    repositoryName: 'app-stock-transfers',
    packageName: 'stock-transfers'
  },
  skus: {
    name: 'SKUs',
    slug: 'skus',
    icon: 'tShirt',
    repositoryName: 'app-skus',
    packageName: 'skus'
  },
  sku_lists: {
    name: 'SKU Lists',
    slug: 'sku_lists',
    icon: 'clipboardText',
    repositoryName: 'app-sku-lists',
    packageName: 'sku-lists'
  },
  imports: {
    name: 'Imports',
    slug: 'imports',
    icon: 'download',
    repositoryName: 'app-imports',
    packageName: 'imports'
  },
  exports: {
    name: 'Exports',
    slug: 'exports',
    icon: 'upload',
    repositoryName: 'app-exports',
    packageName: 'exports'
  },
  webhooks: {
    name: 'Webhooks',
    slug: 'webhooks',
    icon: 'webhooksLogo',
    repositoryName: 'app-webhooks',
    packageName: 'webhooks'
  },
  tags: {
    name: 'Tags',
    slug: 'tags',
    icon: 'tag',
    repositoryName: 'app-tags',
    packageName: 'tags'
  },
  bundles: {
    name: 'Bundles',
    slug: 'bundles',
    icon: 'shapes',
    repositoryName: 'app-bundles',
    packageName: 'bundles'
  },
  gift_cards: {
    name: 'Gift cards',
    slug: 'gift_cards',
    icon: 'gift',
    repositoryName: 'app-gift-cards',
    packageName: 'gift-cards'
  },
  inventory: {
    name: 'Inventory',
    slug: 'inventory',
    icon: 'warehouse',
    repositoryName: 'app-inventory',
    packageName: 'inventory'
  },
  price_lists: {
    name: 'Price lists',
    slug: 'price_lists',
    icon: 'receipt',
    repositoryName: 'app-price-lists',
    packageName: 'price-lists'
  },
  promotions: {
    name: 'Promotions',
    slug: 'promotions',
    icon: 'seal',
    repositoryName: 'app-promotions',
    packageName: 'promotions'
  },
  subscriptions: {
    name: 'Subscriptions',
    slug: 'subscriptions',
    icon: 'calendarCheck',
    repositoryName: 'app-subscriptions',
    packageName: 'subscriptions'
  }
}

export const appLazyImports = Object.values(apps).reduce(
  (acc, app) => {
    return {
      ...acc,
      [app.slug]: lazy(
        async () =>
          await import(`../../../apps/${app.packageName}/src/main.tsx`)
      )
    }
  },
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  {} as Record<AllowedAppSlug, LazyExoticComponent<FC<ClAppProps>>>
)

export const appPromiseImports = Object.values(apps).reduce(
  (acc, app) => {
    return {
      ...acc,
      [app.slug]: {
        app,
        exists: async () =>
          await import(`../../../apps/${app.packageName}/src/main.tsx`)
            .then(() => true)
            .catch(() => false)
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  {} as Record<AllowedAppSlug, { app: App; exists: () => Promise<boolean> }>
)

/**
 * Apply a standard dictionary. There're few words that need to be written in a specific case.
 * @example `paypal` => `PayPal`
 */
function applyDictionary(text: string): string {
  const dict = [
    ['checkout com', 'Checkout.com'],
    ['checkout.com', 'Checkout.com'],
    ['paypal', 'PayPal'],
    ['taxjar', 'TaxJar'],
    ['google', 'Google'],
    ['sku', 'SKU']
  ]

  return dict.reduce((acc, item) => {
    const [input, output] = item

    if (input == null || output == null) {
      return acc
    }

    return acc.replace(new RegExp(input, 'i'), output)
  }, text)
}

/** Convert `sku_option` to `Sku option` */
export function humanReadable(text: string): string {
  const capitalized = text[0]?.toUpperCase() + text.substring(1)
  return applyDictionary(capitalized.replaceAll('_', ' ').replaceAll('-', ' '))
}
