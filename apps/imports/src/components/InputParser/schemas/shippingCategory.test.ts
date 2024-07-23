import { ZodError } from 'zod'
import { csvShippingCategorySchema } from './shippingCategory'

describe('Validate csvShippingCategorySchema', () => {
  test('received input should have a valid Shipping Category schema', () => {
    expect(
      csvShippingCategorySchema.parse([
        {
          name: 'Merchandise',
          reference: 'Sample',
          reference_origin: 'From imports'
        },
        {
          name: 'Hoodies'
        }
      ])
    ).toStrictEqual([
      {
        name: 'Merchandise',
        reference: 'Sample',
        reference_origin: 'From imports'
      },
      {
        name: 'Hoodies'
      }
    ])
  })

  test('Name is required', () => {
    try {
      csvShippingCategorySchema.parse([
        {
          reference: 'Sample'
        }
      ])
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })

  test('Name cannot be blank', () => {
    try {
      csvShippingCategorySchema.parse([
        {
          reference: ''
        }
      ])
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })
})
