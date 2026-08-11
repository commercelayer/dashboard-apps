// @ts-check

import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import externalGlobals from 'rollup-plugin-external-globals'
import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig as vitestDefineConfig } from 'vitest/config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Detect a locally linked `@commercelayer/app-elements`, i.e. a dependency
 * declared as `link:../../../app-elements/packages/app-elements` instead of a
 * published version. Every pnpm dependency is a symlink, but only a linked
 * checkout resolves to a path outside of any `node_modules` directory.
 *
 * Returns `null` for regular installs, so this is a no-op in CI and for anyone
 * not doing local app-elements development.
 * @returns {{ packageDir: string, repoRoot: string, peerDependencies: string[] } | null}
 */
const detectLinkedAppElements = () => {
  try {
    const packageDir = fs.realpathSync(
      path.join(process.cwd(), 'node_modules', '@commercelayer', 'app-elements'),
    )

    if (packageDir.includes(`${path.sep}node_modules${path.sep}`)) {
      return null
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
    )

    return {
      packageDir,
      // the sibling repo root, so Vite may also serve app-elements' own deps
      repoRoot: path.resolve(packageDir, '..', '..'),
      // Only the peers this app installs itself: those are the ones that would
      // otherwise be loaded twice. Deduping a peer the app does not have would
      // instead make it unresolvable (app-elements keeps its own copy).
      peerDependencies: Object.keys(pkg.peerDependencies ?? {}).filter((dep) =>
        fs.existsSync(path.join(process.cwd(), 'node_modules', dep)),
      ),
    }
  } catch {
    return null
  }
}

/**
 * Replace the variable `routerBase` from the HTML with
 * the `base` config attribute from Vite configuration file.
 * @type {(options: { viteBase?: string }) => import('vite').Plugin}
 */
const replaceRouterBase = ({ viteBase = '/' }) => {
  return {
    name: 'router-base-replacer',
    transformIndexHtml(html) {
      return html.replace(
        `routerBase: ''`,
        `routerBase: '${viteBase}'`,
      )
    },
  }
}

/**
 * Replace the variable `routerBase` from the HTML with
 * the `base` config attribute from Vite configuration file.
 * @type {() => import('vite').Plugin}
 */
const injectReact19 = () => {
  return {
    name: 'inject-react-19',
    transformIndexHtml() {
      return [{
        tag: 'script',
        injectTo: 'head-prepend',
        attrs: {
          type: 'module'
        },
        children: `
          import React from "https://esm.sh/react@19.2.4"
          import ReactDOM from "https://esm.sh/react-dom@19.2.4"
          window.React = React
          window.ReactDOM = ReactDOM
        `
      }]
    },
  }
}

/**
 * Define the dashboard-app configuration for Vite.
 * @see https://vitejs.dev/config
 * @param {string} appSlug 
 * @returns 
 */

export const defineConfig = (appSlug) => vitestDefineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const viteBase = env.PUBLIC_PROJECT_PATH != null && env.PUBLIC_PROJECT_PATH !== ''
    ? `/${env.PUBLIC_PROJECT_PATH}/`
    : `/${appSlug}`

  const linkedAppElements = detectLinkedAppElements()

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      replaceRouterBase({ viteBase }),
      injectReact19()
    ],
    envPrefix: 'PUBLIC_',
    base: viteBase,
    // Local app-elements development: run `pnpm build:watch` in
    // app-elements/packages/app-elements and its `dist` is rebuilt on save,
    // which this dev server picks up right away.
    ...(linkedAppElements != null
      ? {
        resolve: {
          // a linked package resolves from its real path, so it would otherwise
          // load its own copy of these singletons (two Reacts => "Invalid hook
          // call", two wouter/react-hook-form => broken router and forms)
          dedupe: linkedAppElements.peerDependencies
        },
        optimizeDeps: {
          // keep Vite from pre-bundling app-elements, so rebuilds are picked up
          // instead of being served from a stale dependency cache
          exclude: ['@commercelayer/app-elements']
        },
        server: {
          fs: {
            // allow serving files from the sibling app-elements repo
            allow: [process.cwd(), linkedAppElements.repoRoot]
          }
        }
      }
      : {}),
    build: {
      emptyOutDir: true,
      outDir: path.resolve(__dirname, '..', '..', 'dist', appSlug),
      modulePreload: false,
      rollupOptions: {
        external: ['react', 'react-dom'],
        plugins: [
          externalGlobals({
            react: 'React',
            'react-dom': 'ReactDOM'
          })
        ]
      },
      manifest: 'manifest.json'
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
