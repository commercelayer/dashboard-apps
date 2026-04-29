import type { ClAppProps } from "@commercelayer/app-elements"
import { type FC, type LazyExoticComponent, lazy } from "react"
import { type App, apps } from "./appList"

export const appLazyImports = Object.values(apps).reduce(
  (acc, app) => {
    return {
      ...acc,
      [app.slug]: lazy(
        async () => await import(`../../../apps/${app.slug}/src/main.tsx`),
      ),
    }
  },
  {} as Record<App["slug"], LazyExoticComponent<FC<ClAppProps>>>,
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
            .catch(() => false),
      },
    }
  },
  {} as Record<App["slug"], { app: App; exists: () => Promise<boolean> }>,
)
