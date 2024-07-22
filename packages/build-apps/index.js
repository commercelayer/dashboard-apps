// @ts-check

import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import externalGlobals from 'rollup-plugin-external-globals'
import { build } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { apps } from '../index/src/appList.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Replace the variable `routerBase` from the HTML with
 * the `base` config attribute from Vite configuration file.
 * @type {(options: { viteBase?: string }) => import('vite').Plugin}
 */
const htmlPlugin = ({ viteBase = '/' }) => {
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
 * Get `root` folder.
 * @param {string} appSlug
 */
function getRoot(appSlug) {
  return path.resolve(__dirname, '..', '..', 'apps', appSlug)
}

const promises = Object.values(apps)
  .map(app => app.slug)
  .filter((appSlug) => {
    const root = getRoot(appSlug)
    return fs.existsSync(root)
  })
  .map(async appSlug => {
    const viteBase = `/${appSlug}`
    return await build({
      root: getRoot(appSlug),
      plugins: [
        react(),
        tsconfigPaths(),
        htmlPlugin({ viteBase }),
      ],
      envPrefix: 'PUBLIC_',
      base: viteBase,
      build: {
        emptyOutDir: true,
        outDir: path.resolve(__dirname, '..', '..', 'dist', appSlug),
        modulePreload: false,
        rollupOptions: {
          external: ['react', 'react-dom'],
          plugins: [
            // @ts-expect-error Type mismatch
            externalGlobals({
              react: 'React',
              'react-dom': 'ReactDOM'
            })
          ]
        },
        manifest: 'manifest.json'
      }
    })
  })

await Promise.all(promises)
