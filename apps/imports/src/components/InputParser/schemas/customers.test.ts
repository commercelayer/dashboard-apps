import { csvCustomersSchema } from './customers'

describe('Validate csvCustomersSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvCustomersSchema.parse([
        {
          email: 'user1@commercelayer.io'
        },
        {
          email: 'user2@commercelayer.io',
          password: 'QWERTY'
        },
        {
          email: 'user3@commercelayer.io',
          password: 123456
        },
        {
          email: 'user4@commercelayer.io',
          customer_group_id: 'xYZkjABcde'
        }
      ])
    ).toStrictEqual([
      {
        email: 'user1@commercelayer.io'
      },
      {
        email: 'user2@commercelayer.io',
        password: 'QWERTY'
      },
      {
        email: 'user3@commercelayer.io',
        password: '123456'
      },
      {
        email: 'user4@commercelayer.io',
        customer_group_id: 'xYZkjABcde'
      }
    ])
  })
})
