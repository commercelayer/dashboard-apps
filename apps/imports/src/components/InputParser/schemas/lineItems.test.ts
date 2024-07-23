import { csvLineItemsSchema } from './lineItems'

describe('Validate csvLineItemsSchema', () => {
  test('received input should have a valid line_items schema', () => {
    expect(
      csvLineItemsSchema.parse([
        {
          sku_code: 'ABC001',
          quantity: 1,
          unit_amount_cents: 200,
          order_id: 'ORDER123'
        },
        {
          bundle_code: 'BUNDLE001',
          quantity: 5,
          unit_amount_cents: 200,
          order_id: 'ORDER123'
        },
        {
          sku_code: 'ABC002',
          quantity: 1,
          unit_amount_cents: 0,
          order_id: 'ORDER123'
        },

        {
          sku_code: 'ABC003',
          quantity: 1,
          unit_amount_cents: '-100',
          order_id: 'ORDER123'
        }
      ])
    ).toStrictEqual([
      {
        sku_code: 'ABC001',
        quantity: 1,
        unit_amount_cents: 200,
        order_id: 'ORDER123'
      },
      {
        bundle_code: 'BUNDLE001',
        quantity: 5,
        unit_amount_cents: 200,
        order_id: 'ORDER123'
      },
      {
        sku_code: 'ABC002',
        quantity: 1,
        unit_amount_cents: 0,
        order_id: 'ORDER123'
      },
      {
        sku_code: 'ABC003',
        quantity: 1,
        unit_amount_cents: -100,
        order_id: 'ORDER123'
      }
    ])
  })

  test('should return error when both sku_code and bundle_code are present', () => {
    const { success } = csvLineItemsSchema.safeParse([
      {
        sku_code: 'ABC001',
        bundle_code: 'BUNDLE001',
        quantity: 1,
        order_id: 'ORDER123'
      }
    ])
    expect(success).toBe(false)
  })

  test('should return error when order_id is missing', () => {
    const { success } = csvLineItemsSchema.safeParse([
      {
        sku_code: 'ABC001',
        quantity: 1
      }
    ])
    expect(success).toBe(false)
  })
})
