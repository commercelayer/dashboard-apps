import { isoDateToDayEdge } from './utils'

describe('isoDateToDayEdge', () => {
  test('should set start of the day in Los Angeles', () => {
    expect(
      isoDateToDayEdge({
        isoString: '2023-02-17T10:31:28.454Z',
        edge: 'startOfTheDay',
        timezone: 'America/Los_Angeles'
      })
    ).toBe('2023-02-17T08:00:00.000Z')
  })

  test('should set start of the day in Rome', () => {
    expect(
      isoDateToDayEdge({
        isoString: '2023-02-17T10:31:28.454Z',
        edge: 'startOfTheDay',
        timezone: 'Europe/Rome'
      })
    ).toBe('2023-02-16T23:00:00.000Z')
  })

  test('should set end of the day in Rome', () => {
    expect(
      isoDateToDayEdge({
        isoString: '2023-02-17T09:31:28.454Z',
        edge: 'endOfTheDay',
        timezone: 'Europe/Rome'
      })
    ).toBe('2023-02-17T22:59:59.999Z')
  })

  test('should work with partial dates', () => {
    expect(
      isoDateToDayEdge({
        isoString: '2023-02-17',
        edge: 'endOfTheDay',
        timezone: 'Europe/Rome'
      })
    ).toBe('2023-02-17T22:59:59.999Z')
  })

  test('should return undefined when a no-date is passed', () => {
    expect(
      isoDateToDayEdge({
        isoString: '',
        edge: 'endOfTheDay',
        timezone: 'Europe/Rome'
      })
    ).toBe(undefined)

    expect(
      isoDateToDayEdge({
        isoString: 'abcddds',
        edge: 'endOfTheDay',
        timezone: 'Europe/Rome'
      })
    ).toBe(undefined)
  })
})
