import { csvCouponsSchema } from './coupon'

describe('Validate csvCouponsSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvCouponsSchema.parse([
        {
          code: 'XXXX123123',
          promotion_rule_id: 'XXXX123',
          usage_limit: 100
        },
        {
          code: 'AAA123333223',
          promotion_rule_id: 'XXXX123',
          usage_limit: '100',
          customer_single_use: true
        }
      ])
    ).toStrictEqual([
      {
        code: 'XXXX123123',
        promotion_rule_id: 'XXXX123',
        usage_limit: 100
      },
      {
        code: 'AAA123333223',
        promotion_rule_id: 'XXXX123',
        usage_limit: 100,
        customer_single_use: true
      }
    ])
  })
})
