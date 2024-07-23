import type { Tag } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeTag = (): Tag => {
  return {
    ...makeResource('tags'),
    name: 'tag-test'
  }
}
