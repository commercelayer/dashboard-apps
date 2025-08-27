import type { ClAppProps } from '@commercelayer/app-elements'
import { lazy, type FC, type LazyExoticComponent } from 'react'
import { apps, type App } from './appList'

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
  {} as Record<App['slug'], LazyExoticComponent<FC<ClAppProps>>>
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
  {} as Record<App['slug'], { app: App; exists: () => Promise<boolean> }>
)
