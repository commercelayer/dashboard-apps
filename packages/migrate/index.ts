import degit from 'degit'
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
  .then(() => console.log('\ndone!'))
