import { type Import, type ListResponse } from '@commercelayer/sdk'
import { getUiStatus, listHasProgressingItems } from './utils'

// getUiStatus
describe('getUiStatus', () => {
  test('should return `progress` status for the `<StatusIcon>` component, when import job is `in_progress`', () => {
    expect(getUiStatus('in_progress')).toBe('progress')
  })

  test('should return `danger` status for the `<StatusIcon>` component when import job is `interrupted`', () => {
    expect(getUiStatus('interrupted')).toBe('danger')
  })

  test('should return `success` status for the `<StatusIcon>` component when import job is `completed`', () => {
    expect(getUiStatus('completed')).toBe('success')
  })

  test('should return `pending` status for the `<StatusIcon>` component when import job is `pending`', () => {
    expect(getUiStatus('pending')).toBe('pending')
  })

  test('should return `pending` status for the `<StatusIcon>` component when import job is unknown', () => {
    expect(getUiStatus('')).toBe('pending')
    expect(getUiStatus(undefined)).toBe('pending')
    expect(getUiStatus('some-not-recognized-text')).toBe('pending')
  })
})

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
