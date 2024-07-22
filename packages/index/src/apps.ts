import type { ClAppProps } from '@commercelayer/app-elements'
import { lazy, type FC, type LazyExoticComponent } from 'react'
import { apps, type AllowedAppSlug, type App } from './appList'

export const appLazyImports = Object.values(apps).reduce(
  (acc, app) => {
    return {
      ...acc,
      [app.slug]: lazy(
        async () => await import(`../../../apps/${app.slug}/src/main.tsx`)
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
          await import(`../../../apps/${app.slug}/src/main.tsx`)
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
