import { csvCustomerSubscriptionsSchema } from './customerSubscriptions'

describe('Validate csvCustomerSubscriptionsSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvCustomerSubscriptionsSchema.parse([
        {
          customer_email: 'user1@commercelayer.io'
        }
      ])
    ).toStrictEqual([
      {
        customer_email: 'user1@commercelayer.io'
      }
    ])
  })
})
