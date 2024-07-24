// @ts-check

const { readFileSync, readdirSync, existsSync } = require('fs')
const { resolve } = require('path')

const { version: lernaVersion } = JSON.parse(readFileSync(resolve(__dirname, 'lerna.json'), 'utf-8'))

const appsPath = resolve(__dirname, 'apps')
const apps = readdirSync(appsPath, { recursive: false, withFileTypes: true })

const filters = apps
  .filter(directory => directory.isDirectory())
  .map(directory => {
    const appPackageJsonPath = resolve(appsPath, directory.name, 'package.json')
    if (!existsSync(appPackageJsonPath)) {
      return null
    }

    const { name, version } = JSON.parse(readFileSync(appPackageJsonPath, 'utf-8'))
    return { name, version }
  })
  .filter(app => {
    return app !== null && app.version === lernaVersion
  })

console.log(`--filter ${filters.map(filter => filter?.name).join(' --filter ')}`)
