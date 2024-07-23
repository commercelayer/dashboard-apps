import { csvStockItemsSchema } from './stockItems'

describe('Validate csvStockItemsSchema', () => {
  test('should require `stock_location_id` when parent resource is not set', () => {
    expect(
      csvStockItemsSchema({ hasParentResource: false }).parse([
        {
          sku_code: 'ABC',
          quantity: '100',
          stock_location_id: 'XXX123'
        },
        {
          quantity: 40,
          stock_location_id: 'XXX123',
          sku_id: 'XYZ'
        }
      ])
    ).toStrictEqual([
      {
        sku_code: 'ABC',
        quantity: 100,
        stock_location_id: 'XXX123'
      },
      {
        sku_id: 'XYZ',
        quantity: 40,
        stock_location_id: 'XXX123'
      }
    ])
  })

  test('should accept zero as quantity', () => {
    expect(
      csvStockItemsSchema({ hasParentResource: false }).parse([
        {
          sku_code: 'ABC',
          quantity: '0',
          stock_location_id: 'XXX123'
        },
        {
          quantity: 0,
          stock_location_id: 'XXX123',
          sku_id: 'XYZ'
        }
      ])
    ).toStrictEqual([
      {
        sku_code: 'ABC',
        quantity: 0,
        stock_location_id: 'XXX123'
      },
      {
        sku_id: 'XYZ',
        quantity: 0,
        stock_location_id: 'XXX123'
      }
    ])
  })

  test('should require `stock_location_id` when parent resource is set', () => {
    expect(
      csvStockItemsSchema({ hasParentResource: true }).parse([
        {
          sku_code: 'ABC',
          quantity: '100'
        },
        {
          quantity: 40,
          sku_id: 'XYZ'
        }
      ])
    ).toStrictEqual([
      {
        sku_code: 'ABC',
        quantity: 100
      },
      {
        sku_id: 'XYZ',
        quantity: 40
      }
    ])
  })
})
