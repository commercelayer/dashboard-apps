import { describe, expect, it } from 'vitest'
import { normalizeLogs } from './normalizeLogs'

describe('normalizeLogs', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime('2024-09-19T14:30:00.000Z')
  })

  afterEach(() => {
    vi.useRealTimers()
  })
  it('should normalize usage logs correctly', () => {
    const result = normalizeLogs({
      usageLog: {
        'order-1': [
          {
            action: 'purchase',
            datetime: '2024-09-18T16:00:00.000Z',
            amount_cents: 0,
            balance_cents: 10000
          }
        ],
        'order-2': [
          {
            action: 'use',
            datetime: '2024-09-20T11:00:00.000Z',
            amount_cents: -5000,
            balance_cents: 5000,
            order_number: '123456789'
          }
        ],
        'order-3': [
          {
            action: 'redeemed',
            datetime: '2024-09-22T16:00:00.000Z',
            amount_cents: -5000,
            balance_cents: 0
          }
        ]
      },
      balanceLog: [
        {
          datetime: '2024-09-18T16:00:00.000Z',
          balance_change_cents: 10000
        },
        {
          datetime: '2024-09-20T11:00:00.000Z',
          balance_change_cents: -5000
        },
        {
          datetime: '2024-09-22T16:00:00.000Z',
          balance_change_cents: -5000
        }
      ],
      timezone: 'UTC',
      currencyCode: 'EUR'
    })

    expect(result).toEqual([
      {
        date: 'Sep 22, 2024, 16:00',
        type: 'Redeemed',
        orderId: 'order-3',
        amount: '€-50,00'
      },
      {
        date: 'Sep 20, 2024, 11:00',
        type: 'Use',
        orderId: 'order-2',
        orderNumber: '123456789',
        amount: '€-50,00'
      },
      {
        date: 'Sep 18, 2024, 16:00',
        type: 'Change',
        orderId: undefined,
        amount: '€100,00'
      },
      {
        date: 'Sep 18, 2024, 16:00',
        type: 'Purchase',
        orderId: 'order-1',
        amount: '€0,00'
      }
    ])
  })

  it('should handle empty logs', () => {
    const result = normalizeLogs({
      usageLog: null,
      balanceLog: null,
      timezone: 'UTC',
      currencyCode: 'EUR'
    })

    expect(result).toEqual([])
  })
})
