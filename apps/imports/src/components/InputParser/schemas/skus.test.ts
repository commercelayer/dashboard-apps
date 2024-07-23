import { csvSkusSchema } from './skus'

describe('Validate skusSchema', () => {
  test('received input should have a valid SKUs schema', () => {
    expect(
      csvSkusSchema.parse([
        {
          code: 'ABC001',
          name: 'T-SHIRT',
          shipping_category_id: 'ABC',
          description: 'Lorem ipsum',
          unit_of_weight: 'gr',
          do_not_track: true
        },
        {
          code: 'XYZ002',
          name: 'MUG',
          shipping_category_id: 'ABC',
          do_not_ship: false,
          pieces_per_pack: 1,
          do_not_track: 'true'
        },
        {
          code: 'XYZ002',
          name: 'MUG',
          shipping_category_id: 'ABC',
          pieces_per_pack: '1',
          weight: '32.60',
          do_not_ship: 'true',
          image_url: 'https://url.com/image.jpg'
        }
      ])
    ).toStrictEqual([
      {
        code: 'ABC001',
        name: 'T-SHIRT',
        shipping_category_id: 'ABC',
        description: 'Lorem ipsum',
        unit_of_weight: 'gr',
        do_not_track: true
      },
      {
        code: 'XYZ002',
        name: 'MUG',
        pieces_per_pack: 1,
        shipping_category_id: 'ABC',
        do_not_ship: false,
        do_not_track: true
      },
      {
        code: 'XYZ002',
        name: 'MUG',
        shipping_category_id: 'ABC',
        weight: 32.6,
        pieces_per_pack: 1,
        do_not_ship: true,
        image_url: 'https://url.com/image.jpg'
      }
    ])
  })

  test('should require shipping_category_id if shippable', () => {
    const withShippingCategory = csvSkusSchema.safeParse([
      {
        code: 'ABC001',
        name: 'T-SHIRT',
        shipping_category_id: 'ABC'
      }
    ])
    const withOutShippingCategory = csvSkusSchema.safeParse([
      {
        code: 'ABC001',
        name: 'T-SHIRT'
      }
    ])
    expect(withShippingCategory.success).toBe(true)
    expect(withOutShippingCategory.success).toBe(false)
  })

  test('should NOT require shipping_category_id if NOT shippable', () => {
    const { success } = csvSkusSchema.safeParse([
      {
        code: 'ABC001',
        name: 'T-SHIRT',
        do_not_ship: true
      }
    ])
    expect(success).toBe(true)
  })
})
