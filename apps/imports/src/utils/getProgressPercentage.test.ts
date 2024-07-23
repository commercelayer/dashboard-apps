/* eslint-disable @typescript-eslint/naming-convention */
import { type Import } from '@commercelayer/sdk'
import { getProgressPercentage } from './getProgressPercentage'

const mockImportTask = (
  processed_count: number | string,
  inputs_size: number | string
): Import => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    processed_count,
    inputs_size
  } as Import
}

// getProgressPercentage
describe('getProgressPercentage', () => {
  test('should return 100% when completed', () => {
    const job = mockImportTask(453, 453)
    expect(getProgressPercentage(job)).toMatchObject({
      value: 100,
      formatted: '100%'
    })
  })

  test('should return a rounded int', () => {
    const item = mockImportTask(3, 10)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 30,
      formatted: '30%'
    })
  })

  test('should return a rounded int (floor)', () => {
    const item = mockImportTask(124, 266)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 46,
      formatted: '46%'
    })
  })

  test('should return a zero', () => {
    const item = mockImportTask(0, 400)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 0,
      formatted: '0%'
    })
  })

  test('should always stay close to 99% when about to finish', () => {
    const item = mockImportTask(99999999, 100000000)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 99,
      formatted: '99%'
    })
  })

  test('should never exceed 100%', () => {
    const item = mockImportTask(400, 300)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 100,
      formatted: '100%'
    })
  })

  test('should also accept string', () => {
    const item = mockImportTask('30', 60)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 50,
      formatted: '50%'
    })
  })

  test('should not throw errors when total is zero', () => {
    const item = mockImportTask(10, 0)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 0,
      formatted: '0%'
    })
  })

  test('should not throw errors, but return 0%, when values are null or undefined', () => {
    // @ts-expect-error testing with no args
    const item = mockImportTask(null, undefined)
    expect(getProgressPercentage(item)).toMatchObject({
      value: 0,
      formatted: '0%'
    })
  })
})
