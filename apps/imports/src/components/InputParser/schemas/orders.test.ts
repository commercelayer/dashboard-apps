import { csvOrdersSchema } from './orders'

describe('Validate csvOrdersSchema', () => {
  test('should require `market_id` when parent resource is not set', () => {
    expect(
      csvOrdersSchema({ hasParentResource: false }).parse([
        {
          autorefresh: 'false',
          market_id: 'XXXX123'
        },
        {
          customer_email: 'user@example.com',
          market_id: 'XXXX123'
        }
      ])
    ).toStrictEqual([
      {
        autorefresh: false,
        market_id: 'XXXX123'
      },
      {
        customer_email: 'user@example.com',
        market_id: 'XXXX123'
      }
    ])
  })

  test('`market_id` is not required when parent resource is already set', () => {
    expect(
      csvOrdersSchema({ hasParentResource: true }).parse([
        {
          customer_email: 'user@example.com',
          language_code: 'it'
        }
      ])
    ).toStrictEqual([
      {
        customer_email: 'user@example.com',
        language_code: 'it'
      }
    ])
  })

  test('should return error when `market_id` or parent resource is not present', () => {
    const { success } = csvOrdersSchema({
      hasParentResource: false
    }).safeParse([
      {
        customer_email: 'user@example.com',
        language_code: 'it'
      }
    ])
    expect(success).toBe(false)
  })

  test('should return error when `customer_email` is wrong email format', () => {
    const { success } = csvOrdersSchema({
      hasParentResource: true
    }).safeParse([
      {
        customer_email: 'usermail',
        language_code: 'it'
      }
    ])
    expect(success).toBe(false)
  })

  test('should return error when `language_code` is more than 2 chars length', () => {
    const { success } = csvOrdersSchema({
      hasParentResource: true
    }).safeParse([
      {
        language_code: 'ita'
      }
    ])
    expect(success).toBe(false)
  })

  test('should allow a `status` only if `_archive` is true', () => {
    const { success } = csvOrdersSchema({
      hasParentResource: true
    }).safeParse([
      {
        status: 'placed',
        _archive: true
      }
    ])
    expect(success).toBe(true)
  })

  test('should return error when `status` is passed without `_archive` as true', () => {
    const { success } = csvOrdersSchema({
      hasParentResource: true
    }).safeParse([
      {
        status: 'draft'
      }
    ])
    expect(success).toBe(false)
  })
})
