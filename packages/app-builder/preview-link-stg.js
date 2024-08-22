// @ts-check

/**
 * This script duplicates the apps within the dist folder and create an stg version for each of them.
 * The stg version points to .co
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const distPath = path.resolve(__dirname, '..', '..', 'dist')

const distContent = fs
  .readdirSync(distPath)
  .filter(folder => /^[a-z_]+$/.test(folder))

distContent.forEach((appSlug) => {
  const source = path.resolve(distPath, appSlug)
  const destination = path.resolve(distPath, `${appSlug}-stg`)
  fs.cpSync(source, destination, { force: true, recursive: true })
  
  const configLocalJsPath = path.resolve(distPath, `${appSlug}-stg`, 'config.local.js')
  fs.writeFileSync(configLocalJsPath, `window.clAppConfig = {
  domain: 'commercelayer.co'
}
`)

  const indexPath = path.resolve(distPath, `${appSlug}-stg`, 'index.html')
  const indexContent = fs.readFileSync(indexPath, { encoding: 'utf8' })
  fs.writeFileSync(
    indexPath,
    indexContent.replace(new RegExp(`/${appSlug}`, 'gm'), `/${appSlug}-stg`),
    { encoding: 'utf8' }
  )
})

console.log('\nCreating STG version for:')
console.log(distContent)