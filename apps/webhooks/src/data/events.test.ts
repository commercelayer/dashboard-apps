import { isResourceWithEvent, webhookEvents } from '#data/events'
import { getEventsByResourceType } from './events'

describe('getEventsByResourceType', () => {
  test('Should retrieve a list of events', () => {
    expect(getEventsByResourceType('gift_cards')).toMatchObject([
      'activate',
      'create',
      'deactivate',
      'destroy',
      'purchase',
      'redeem',
      'tagged',
      'use'
    ])
  })

  test('Should retrieve a list of events for all ResourceWithEvent types', () => {
    Object.keys(webhookEvents).forEach((resourceType) => {
      if (!isResourceWithEvent(resourceType)) {
        return false
      }

      expect(getEventsByResourceType(resourceType)).toMatchObject(
        webhookEvents[resourceType]
      )
    })
  })
})
