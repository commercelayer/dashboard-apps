import {
  showResourceNiceName,
  isAvailableResource,
  availableResources
} from './resources'

describe('showResourceNiceName', () => {
  test('Should return the full resource name', () => {
    expect(showResourceNiceName('sku_lists')).toBe('SKU lists')
  })

  test('Should return the the id name if not found in dictionary', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(showResourceNiceName('new_resource' as any)).toBe('new_resource')
  })

  test('Should not break if resource is empty', () => {
    expect(showResourceNiceName(undefined)).toBe('-')
  })
})

describe('isAvailableResource', () => {
  test('Should return true when a valid resource type is passed', () => {
    expect(isAvailableResource('skus')).toBe(true)
  })

  test('Should return true for all availableResources', () => {
    availableResources.forEach((resourceType) => {
      expect(isAvailableResource(resourceType)).toBe(true)
    })
  })

  test('Should return false when an invalid resource is passed', () => {
    expect(isAvailableResource('foobar')).toBe(false)
  })

  test('Should be case insensitive', () => {
    expect(isAvailableResource('SKUS')).toBe(false)
  })

  test('Should return false when a not string is passed', () => {
    expect(isAvailableResource(undefined)).toBe(false)
    expect(isAvailableResource(null)).toBe(false)
    expect(isAvailableResource(['skus'])).toBe(false)
    expect(isAvailableResource(124)).toBe(false)
  })
})
