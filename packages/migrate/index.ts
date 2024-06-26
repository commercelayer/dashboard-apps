import degit from 'degit'
import { replaceInFileSync, type ReplaceInFileConfig } from 'replace-in-file'
import { apps } from '../index/src/apps'

const appPromises = Object.values(apps)
  .map(app => {
    const emitter = degit(`https://github.com/commercelayer/${app.repositoryName}/packages/app`, {
      cache: false,
      force: true,
      verbose: false
    })

    // emitter.on('info', info => {
    //   console.log(info.message)
    // })

    return emitter.clone(`../../apps/${app.packageName}`)
      .then(() => {
        console.log(`${app.packageName}: done`)
      }).catch((e) => {
        if (e.code === 'MISSING_REF') {
          console.error(`${app.packageName}: missing repository`)
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

    return appElements.clone(`../app-elements`)
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

    return appElements.clone(`../app-elements-docs`)
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
      '../../apps/**/node_modules/**',
      '../../packages/**/node_modules/**',
    ]

    const tasks: ReplaceInFileConfig[] = [
      {
        // rename package.json `name`
        from: /"(name)": "([\w-]+)",/gm,
        to: (...args) => {
          const file = args.pop()
          const folderName = file?.match(/apps\/([\w-]+)\/package.json$/)?.[1]
          console.log(file, folderName)
          return `"name": "${folderName}",`
        },
        files: [
          '../../apps/**/package.json'
        ],
      },
      {
        // remove `vite.config.mts` from 'tsconfig.json'
        from: [
          ',\n    "vite.config.mts"',
          '\n    "*.config.mts",',
          '\n    "*.config.ts",',
          '\n    "*.config.js",',
          '\n    "*.config.cjs",',
        ],
        to: '',
        files: [
          '../../apps/**/tsconfig.json',
          '../../packages/**/tsconfig.json'
        ],
      }
    ]

    const results = tasks.flatMap(task => replaceInFileSync({
      dry,
      ignore,
      ...task
    }))

    const filteredResults = results.filter(r => r.hasChanged).map(r => r.file)
    let uniqueFilteredResults = [...new Set(filteredResults)]

    if (uniqueFilteredResults.length > 0) {
      console.group('\nUpdating source code:',)
      uniqueFilteredResults.forEach(r => {
        console.info('→', r)
      })
      console.groupEnd()
    }
  })
  .then(() => console.log('\ndone!'))
