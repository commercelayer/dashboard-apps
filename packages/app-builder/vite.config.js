// @ts-check

import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import externalGlobals from 'rollup-plugin-external-globals'
import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig as vitestDefineConfig } from 'vitest/config'

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

  return {
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
