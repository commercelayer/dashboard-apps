import type { Resource } from '@commercelayer/sdk'

export * from './resources/priceLists'
export * from './resources/prices'
export * from './resources/priceTiers'
export * from './resources/skus'

export const isMockedId = (id: string): boolean => {
  return id.startsWith('fake-')
}

export const isMock = (resource: Resource): boolean => {
  return isMockedId(resource.id)
}

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
