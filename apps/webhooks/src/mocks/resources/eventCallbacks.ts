import type { EventCallback } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeEventCallback = (): EventCallback => {
  return {
    ...makeResource('event_callbacks'),
    callback_url: ''
  }
}
