import type { Webhook } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeWebhook = (): Webhook => {
  return {
    ...makeResource('webhooks'),
    topic: '',
    callback_url: '',
    shared_secret: ''
  }
}
