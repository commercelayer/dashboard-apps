import degit from 'degit'
import { replaceInFileSync, type ReplaceInFileConfig } from 'replace-in-file'

const repositories = [
  'app-orders',
  'app-shipments',
  'app-customers',
  'app-returns',
  'app-stock-transfers',
  'app-skus',
  'app-sku-lists',
  'app-imports',
  'app-exports',
  'app-webhooks',
  'app-tags',
  'app-bundles',
  'app-gift-cards',
  'app-inventory',
  'app-price-lists',
  'app-promotions',
  'app-subscriptions'
]

const appPromises = repositories
  .map(repositoryName => {
    const emitter = degit(`https://github.com/commercelayer/${repositoryName}/packages/app`, {
      cache: false,
      force: true,
      verbose: false
    })

    // emitter.on('info', info => {
    //   console.log(info.message)
    // })

    const packageName = repositoryName.replace('app-', '')

    return emitter.clone(`../apps/${packageName}`)
      .then(() => {
        console.log(`${packageName}: done`)
      }).catch((e) => {
        if (e.code === 'MISSING_REF') {
          console.error(`${packageName}: missing repository`)
        } else {
          console.error(e)
        }
      })
  })

Promise.all(appPromises)
  .then(() => {
    const appElements = degit(`https://github.com/commercelayer/app-elements/packages/app-elements`, {
      cache: false,
      force: true,
      verbose: false
    })

    return appElements.clone(`../packages/app-elements`)
      .then(() => {
        console.log(`app-elements: done`)
      }).catch((e) => {
        console.error(e)
      })
  })
  .then(() => {
    const appElements = degit(`https://github.com/commercelayer/app-elements/packages/docs`, {
      cache: false,
      force: true,
      verbose: false
    })

    return appElements.clone(`../packages/app-elements-docs`)
      .then(() => {
        console.log(`app-elements-docs: done`)
      }).catch((e) => {
        console.error(e)
      })
  })
  .then(() => {
    const dry = false
    const ignore = [
      './node_modules/**',
      './**/node_modules/**',
      '../apps/**/node_modules/**',
      '../packages/**/node_modules/**',
    ]

    const tasks: { name: string, config: ReplaceInFileConfig }[] = [
      {
        name: 'rename package.json `name`',
        config: {
          from: /"(name)": "([\w-]+)",/gm,
          to: (...args) => {
            const file = args.pop()
            const folderName = file?.match(/apps\/([\w-]+)\/package.json$/)?.[1]
            // console.log(file, folderName)
            return `"name": "${folderName}",`
          },
          files: [
            '../apps/**/package.json'
          ],
        }
      },
      {
        name: 'remove `vite.config.*` from "tsconfig.json"',
        config: {
          from: [
            ',\n    "vite.config.mts"',
            '\n    "*.config.mts",',
            '\n    "*.config.ts",',
            '\n    "*.config.js",',
            '\n    "*.config.cjs",',
          ],
          to: '',
          files: [
            '../apps/**/tsconfig.json',
            '../packages/**/tsconfig.json'
          ],
        }
      },
      {
        name: 'use `app-elements` from "workspace:*"',
        config: {
          from: /"@commercelayer\/app-elements": "([\w-\.\^\~]+)"/gm,
          to: '"@commercelayer/app-elements": "workspace:*"',
          files: [
            '../apps/**/package.json'
          ],
        }
      }
    ]

    tasks.forEach((task) => {
      const results = replaceInFileSync({
        dry,
        ignore,
        ...task.config
      })

      const filteredResults = results.filter(r => r.hasChanged).map(r => r.file)

      let uniqueFilteredResults = [...new Set(filteredResults)]

      if (uniqueFilteredResults.length > 0) {
        console.group(`\n${task.name}:`,)
        uniqueFilteredResults.forEach(r => {
          console.info('→', r)
        })
        console.groupEnd()
      }
    })

  })
  .then(() => console.log('\ndone!'))
