import { csvCustomerPaymentSourcesSchema } from './customerPaymentSources'

describe('Validate csvCustomerPaymentSourcesSchema', () => {
  test('received input should have a valid schema - mandatory fields', () => {
    expect(
      csvCustomerPaymentSourcesSchema.parse([
        {
          customer_id: 'abc123'
        },
        {
          customer_id: 'xyz456'
        }
      ])
    ).toStrictEqual([
      {
        customer_id: 'abc123'
      },
      {
        customer_id: 'xyz456'
      }
    ])
  })

  test('received input should have a valid schema', () => {
    expect(
      csvCustomerPaymentSourcesSchema.parse([
        {
          customer_id: 'abc123',
          customer_token: 'xxxxx'
        },
        {
          customer_id: 'xyz456',
          customer_token: 'cus_xxxyyyzzz',
          payment_source_token: 'pm_xxxyyyzzz'
        }
      ])
    ).toStrictEqual([
      {
        customer_id: 'abc123',
        customer_token: 'xxxxx'
      },
      {
        customer_id: 'xyz456',
        customer_token: 'cus_xxxyyyzzz',
        payment_source_token: 'pm_xxxyyyzzz'
      }
    ])
  })
})
