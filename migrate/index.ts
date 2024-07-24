import degit from 'degit'
import fs from 'node:fs'
import path from 'node:path'
import { replaceInFileSync, type ReplaceInFileConfig } from 'replace-in-file'
import { apps } from '../packages/index/src/appList'


async function run() {
  console.group('download repositories:')
  await downloadAppRepositories()
  // await downloadAppElements()
  // await downloadAppElementsDocumentation()
  console.groupEnd()

  await runTasks()
}

function rmSafeSync(path: string) {
  if (fs.existsSync(path)) {
    fs.rmSync(path)
  }
}

async function downloadAppRepositories() {
  return Promise.all(
    Object.entries(apps)
      .map(([_key, { repositoryName, slug }]) => {
        const emitter = degit(`https://github.com/commercelayer/${repositoryName}/packages/app`, {
          cache: false,
          force: true,
          verbose: false
        })

        // emitter.on('info', info => {
        //   console.log(info.message)
        // })

        const appPath = path.resolve('..', 'apps', slug)

        return emitter.clone(appPath)
          .then(() => {
            rmSafeSync(path.resolve(appPath, 'vercel.json'))
            rmSafeSync(path.resolve(appPath, 'vite.config.ts'))
            rmSafeSync(path.resolve(appPath, 'vite.config.mts'))
            rmSafeSync(path.resolve(appPath, 'vite.config.js'))
            rmSafeSync(path.resolve(appPath, 'vite.config.mjs'))
            fs.writeFileSync(
              path.resolve(appPath, 'vite.config.js'),
              `// @ts-check
import { defineConfig } from '@commercelayer/app-builder/vite.config'
export default defineConfig('${slug}')
`,
              'utf-8'
            )

            console.log(`${repositoryName}: done`)
          }).catch((e) => {
            if (e.code === 'MISSING_REF') {
              console.error(`${repositoryName}: missing repository`)
            } else {
              console.error(e)
            }
          })
      })
  )
}

async function downloadAppElements() {
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
}

async function downloadAppElementsDocumentation() {
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
}

async function runTasks() {
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
          const folderName = file?.match(/apps\/([\w-]+)\/.*$/)?.[1]
          // console.log(file, folderName)
          return `"name": "app-${folderName}",`
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
    // {
    //   name: 'use `app-elements` from "workspace:*"',
    //   config: {
    //     from: /"@commercelayer\/app-elements": "([\w-\.\^\~]+)"/gm,
    //     to: '"@commercelayer/app-elements": "workspace:*"',
    //     files: [
    //       '../apps/**/package.json'
    //     ],
    //   }
    // },
    {
      name: 'make vitest pass with no tests',
      config: {
        from: 'vitest run",',
        to: 'vitest run --passWithNoTests",',
        files: [
          '../apps/**/package.json'
        ],
      }
    },
    {
      name: 'make vitest:watch pass with no tests',
      config: {
        from: 'vitest",',
        to: 'vitest --passWithNoTests",',
        files: [
          '../apps/**/package.json'
        ],
      }
    },
    {
      name: 'set',
      config: {
        from: `: '/'`,
        to: (...args) => {
          const file = args.pop()
          const folderName = file?.match(/apps\/([\w-]+)\/.*$/)?.[1]
          // console.log(file, folderName)
          return `: '/${folderName}'`
        },
        files: [
          '../apps/**/vite.config.*'
        ],
      }
    },
    {
      name: 'install `@commercelayer/app-builder` as `devDependency`',
      config: {
        from: '"devDependencies": {',
        to: '"devDependencies": {\n    "@commercelayer/app-builder": "workspace:*",',
        files: [
          '../apps/**/package.json'
        ],
      }
    },
    {
      name: 'add `vite.config.js` to tsconfig.json',
      config: {
        from: '"include": [',
        to: '"include": [\n    "vite.config.js",',
        files: [
          '../apps/**/tsconfig.json'
        ],
      }
    },
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
}

run().then(() => {
  console.log('\ndone!\n')
})
