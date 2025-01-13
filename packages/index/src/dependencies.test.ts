import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { resolve } from 'path'
import { describe, it } from 'vitest'

interface PnpmLock {
  packages?: Record<string, any>
}

let pnpmLock: PnpmLock

beforeAll(() => {
  const fileContents = fs.readFileSync(
    resolve(__dirname, '..', '..', '..', 'pnpm-lock.yaml'),
    'utf8'
  )

  pnpmLock = yaml.load(fileContents) as PnpmLock
})

describe('Dependencies', () => {
  if (process.env.CI === undefined) {
    return
  }

  it('should have only one "@commercelayer/app-elements"', () => {
    const keys = Object.keys(pnpmLock.packages ?? {}).filter((key) =>
      key.startsWith('@commercelayer/app-elements')
    )

    expect(keys.length, JSON.stringify(keys, null, 2)).toBe(1)
  })

  it('should avoid using pkg.pr.new', () => {
    const keys = Object.keys(pnpmLock.packages ?? {}).filter((key) =>
      key.match(/^@commercelayer.*@https:\/\/pkg\.pr\.new\//)
    )

    expect(keys.length, JSON.stringify(keys, null, 2)).toBe(0)
  })
})
