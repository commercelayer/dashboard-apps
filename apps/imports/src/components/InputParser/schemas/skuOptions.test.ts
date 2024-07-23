import { csvSkuOptionSchema } from './skuOptions'

describe('Validate csvSkuOptionSchema', () => {
  test('should have a valid schema', () => {
    expect(
      csvSkuOptionSchema({ hasParentResource: true }).parse([
        {
          name: 'Engraving',
          description: 'Lorem ipsum ',
          price_amount_cents: 100,
          delay_hours: '10',
          reference: 'data entry',
          reference_origin: 'import task'
        },
        {
          name: 'Printing',
          sku_code_regex: '^(A|B).*$'
        }
      ])
    ).toStrictEqual([
      {
        name: 'Engraving',
        description: 'Lorem ipsum ',
        price_amount_cents: 100,
        delay_hours: 10,
        reference: 'data entry',
        reference_origin: 'import task'
      },
      {
        name: 'Printing',
        sku_code_regex: '^(A|B).*$'
      }
    ])
  })

  test('if has a `market_id` and no parent resource, `currency_code` is non required', () => {
    expect(
      csvSkuOptionSchema({ hasParentResource: false }).parse([
        {
          name: 'Engraving',
          market_id: 'xgH3x9sB',
          description: 'Lorem ipsum ',
          price_amount_cents: 100,
          delay_hours: '10',
          reference: 'data entry',
          reference_origin: 'import task'
        }
      ])
    ).toStrictEqual([
      {
        name: 'Engraving',
        market_id: 'xgH3x9sB',
        description: 'Lorem ipsum ',
        price_amount_cents: 100,
        delay_hours: 10,
        reference: 'data entry',
        reference_origin: 'import task'
      }
    ])
  })

  test('should fail when missing parent resource, `market_id` and `currency_code`', () => {
    const { success } = csvSkuOptionSchema({
      hasParentResource: false
    }).safeParse([
      {
        name: 'Engraving'
      }
    ])
    expect(success).toBe(false)
  })

  test('should fail error when missing parent resource and `currency_code` and `market_id` is empty string', () => {
    const { success } = csvSkuOptionSchema({
      hasParentResource: false
    }).safeParse([
      {
        name: 'Engraving',
        market_id: ''
      }
    ])
    expect(success).toBe(false)
  })

  test('should require `currency_code` when market_id is not set', () => {
    const { success } = csvSkuOptionSchema({
      hasParentResource: false
    }).safeParse([
      {
        name: 'Engraving',
        currency_code: 'EUR'
      }
    ])
    expect(success).toBe(true)
  })

  test('should return error when name is not passed', () => {
    const { success } = csvSkuOptionSchema({
      hasParentResource: false
    }).safeParse([
      {
        description: 'lorem ipsum',
        market_id: 'abc'
      }
    ])
    expect(success).toBe(false)
  })
})
