import { ZodError } from 'zod'
import { csvBundleSchema } from './bundle'

describe('Validate csvBundleSchema', () => {
  test('received input should have a valid schema without parent resource', () => {
    expect(
      csvBundleSchema({ hasParentResource: false }).parse([
        {
          code: 'KIT001',
          name: 'Bundle kit 01',
          currency_code: 'EUR',
          description: 'Lorem ipsum...',
          image_url: 'https://www.example.com/image.jpg',
          do_not_ship: 'true',
          do_not_track: false,
          price_amount_cents: 12000,
          compare_at_amount_cents: 10000,
          _compute_price_amount: true,
          _compute_compare_at_amount: 'false',
          sku_list_id: 'XB123'
        }
      ])
    ).toStrictEqual([
      {
        code: 'KIT001',
        name: 'Bundle kit 01',
        currency_code: 'EUR',
        description: 'Lorem ipsum...',
        image_url: 'https://www.example.com/image.jpg',
        do_not_ship: true,
        do_not_track: false,
        price_amount_cents: 12000,
        compare_at_amount_cents: 10000,
        _compute_price_amount: true,
        _compute_compare_at_amount: false,
        sku_list_id: 'XB123'
      }
    ])
  })

  test('only required fileds', () => {
    expect(
      csvBundleSchema({ hasParentResource: true }).parse([
        {
          code: 'KIT001',
          name: 'Bundle kit 01',
          price_amount_cents: '1000',
          compare_at_amount_cents: 1000,
          currency_code: 'EUR'
        }
      ])
    ).toStrictEqual([
      {
        code: 'KIT001',
        name: 'Bundle kit 01',
        price_amount_cents: 1000,
        compare_at_amount_cents: 1000,
        currency_code: 'EUR'
      }
    ])
  })

  test('received input should have a valid schema with a given parent resource', () => {
    expect(
      csvBundleSchema({ hasParentResource: true }).parse([
        {
          code: 'KIT001',
          name: 'Bundle kit 01',
          currency_code: 'EUR',
          description: 'Lorem ipsum...',
          image_url: 'https://www.example.com/image.jpg',
          do_not_ship: 'true',
          do_not_track: false,
          price_amount_cents: 12000,
          compare_at_amount_cents: 10000,
          _compute_price_amount: true,
          _compute_compare_at_amount: 'false'
        }
      ])
    ).toStrictEqual([
      {
        code: 'KIT001',
        name: 'Bundle kit 01',
        currency_code: 'EUR',
        description: 'Lorem ipsum...',
        image_url: 'https://www.example.com/image.jpg',
        do_not_ship: true,
        do_not_track: false,
        price_amount_cents: 12000,
        compare_at_amount_cents: 10000,
        _compute_price_amount: true,
        _compute_compare_at_amount: false
      }
    ])
  })

  test('currency code is not needed if market_id is specified', () => {
    expect(
      csvBundleSchema({ hasParentResource: true }).parse([
        {
          code: 'KIT001',
          name: 'Bundle kit 01',
          description: 'Lorem ipsum...',
          image_url: 'https://www.example.com/image.jpg',
          do_not_ship: 'true',
          do_not_track: false,
          price_amount_cents: 12000,
          compare_at_amount_cents: 10000,
          _compute_price_amount: true,
          _compute_compare_at_amount: 'false',
          market_id: 'xfS2u4Ps'
        }
      ])
    ).toStrictEqual([
      {
        code: 'KIT001',
        name: 'Bundle kit 01',
        description: 'Lorem ipsum...',
        image_url: 'https://www.example.com/image.jpg',
        do_not_ship: true,
        do_not_track: false,
        price_amount_cents: 12000,
        compare_at_amount_cents: 10000,
        _compute_price_amount: true,
        _compute_compare_at_amount: false,
        market_id: 'xfS2u4Ps'
      }
    ])
  })

  test('currency code is required if market_id is not specified', () => {
    try {
      csvBundleSchema({ hasParentResource: true }).parse([
        {
          code: 'KIT001',
          name: 'Bundle kit 01',
          description: 'Lorem ipsum...',
          image_url: 'https://www.example.com/image.jpg',
          do_not_ship: 'true',
          do_not_track: false,
          price_amount_cents: 12000,
          compare_at_amount_cents: 10000,
          _compute_price_amount: true,
          _compute_compare_at_amount: 'false'
        }
      ])
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })
})
