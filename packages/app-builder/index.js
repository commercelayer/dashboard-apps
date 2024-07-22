// @ts-check

import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import externalGlobals from 'rollup-plugin-external-globals'
import { build } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { apps } from '../index/src/appList.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'lerna.json'), 'utf-8'))

const argv = await yargs(hideBin(process.argv))
  .usage('Usage: pnpm build:apps-single [options]')
  .version(version)
  .option('list', {
    alias: 'l',
    describe: 'List of app slugs to build',
    array: true,
    string: true,
    default: Object.values(apps).map(app => app.slug)
  })
  .help('h')
  .alias('h', 'help')
  .parse()

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

/** @type {Record<string, { msg: string; level: 'error' | 'warn' | 'info' }[]>} */
const logs = {}

const appsToBuild = argv.list
  .filter((appSlug) => {
    const root = getRoot(appSlug)
    return fs.existsSync(root)
  })

console.group(`> list`)
appsToBuild.forEach(appSlug => console.info(`- ${appSlug}`))
console.groupEnd()
console.log('\n')

const promises = appsToBuild
  .map(async appSlug => {
    const viteBase = `/${appSlug}`
    const results = await build({
      clearScreen: false,
      customLogger: {
        clearScreen: () => {},
        error: (msg) => {
          logs[appSlug] = logs[appSlug] ?? []
          logs[appSlug].push({ msg, level: 'error' })
        },
        hasErrorLogged: () => true,
        hasWarned: true,
        info: (msg) => {
          logs[appSlug] = logs[appSlug] ?? []
          logs[appSlug].push({ msg, level: 'info' })
        },
        warn: (msg) => {
          logs[appSlug] = logs[appSlug] ?? []
          logs[appSlug].push({ msg, level: 'warn' })
        },
        warnOnce: (msg) => {
          logs[appSlug] = logs[appSlug] ?? []
          logs[appSlug].push({ msg, level: 'warn' })
        }
      },
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
            externalGlobals({
              react: 'React',
              'react-dom': 'ReactDOM'
            })
          ]
        },
        manifest: 'manifest.json'
      }
    })

    console.group(`> ${appSlug}`)
    logs[appSlug].forEach(({ level, msg }) => {
      console[level](msg)
    })
    console.groupEnd()
    console.log('\n')

    return results
  })

await Promise.all(promises)
