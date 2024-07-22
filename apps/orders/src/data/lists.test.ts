import { presets } from '#data/lists'

describe('filtersByListType', () => {
  test('should have the correct keys', () => {
    expect(Object.keys(presets)).toEqual([
      'awaitingApproval',
      'editing',
      'paymentToCapture',
      'fulfillmentInProgress',
      'history',
      'pending',
      'archived'
    ])
  })
})
