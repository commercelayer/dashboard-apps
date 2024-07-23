import { appRoutes, type AppRoute } from './routes'

describe('appRoutes', () => {
  test('Every route should have a `path` property', () => {
    const allRoutes = Object.keys(appRoutes) as AppRoute[]
    expect(allRoutes.every((route) => 'path' in appRoutes[route])).toBe(true)
  })

  test('Every route should have a `makePath` method', () => {
    const allRoutes = Object.keys(appRoutes) as AppRoute[]
    expect(allRoutes.every((route) => 'makePath' in appRoutes[route])).toBe(
      true
    )
    expect(allRoutes.every(isMakePathAFunction)).toBe(true)
  })
})

const isMakePathAFunction = (route: AppRoute): boolean =>
  typeof appRoutes[route].makePath === 'function'
