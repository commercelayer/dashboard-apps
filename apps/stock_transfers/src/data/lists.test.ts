import { presets } from '#data/lists'

describe('filtersByListType', () => {
  test('should have the correct keys', () => {
    expect(Object.keys(presets)).toEqual([
      'on_hold',
      'picking',
      'in_transit',
      'history'
    ])
  })
})
