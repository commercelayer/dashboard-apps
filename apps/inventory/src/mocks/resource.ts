import type { ResourceTypeLock } from '@commercelayer/sdk/lib/cjs/api'

interface GenericResource<T> {
  readonly type: T
  id: string
  created_at: string
  updated_at: string
}

export const makeResource = <T extends ResourceTypeLock>(
  type: T
): GenericResource<T> => {
  return {
    type,
    id: `fake-${Math.random()}`,
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON()
  }
}
