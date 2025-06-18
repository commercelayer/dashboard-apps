import { type Import, type ListResponse } from '@commercelayer/sdk'
import { listHasProgressingItems } from './utils'

describe('shouldPoll', () => {
  test('no poll when list is empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(listHasProgressingItems([] as any)).toBe(false)
  })

  test('poll when at least one pending is found', () => {
    expect(
      listHasProgressingItems([
        interrupted,
        completed,
        completed,
        pending,
        completed
      ] as ListResponse<Import>)
    ).toBe(true)
  })

  test('poll when at least one in_progress is found', () => {
    expect(
      listHasProgressingItems([
        interrupted,
        progress,
        completed
      ] as ListResponse<Import>)
    ).toBe(true)
  })

  test('no poll when no pending and  in_progress', () => {
    expect(
      listHasProgressingItems([
        interrupted,
        completed,
        completed
      ] as ListResponse<Import>)
    ).toBe(false)
  })

  test('list contains empty job status', () => {
    expect(
      listHasProgressingItems([completed, {}] as ListResponse<Import>)
    ).toBe(false)
  })
})

const pending = { status: 'pending' } as unknown as Import
const progress = { status: 'in_progress' } as unknown as Import
const completed = { status: 'completed' } as unknown as Import
const interrupted = { status: 'interrupted' } as unknown as Import
