import { csvSkuListItemsSchema } from './skuListItems'

describe('Validate csvSkuListItemsSchema', () => {
  test('received input should have a valid Sku Lists schema', () => {
    expect(
      csvSkuListItemsSchema.parse([
        {
          sku_list_id: 'LISTABC123',
          sku_id: 'SKU123'
        },
        {
          position: '4',
          quantity: '2',
          sku_list_id: 'LISTABC123',
          sku_id: 'SKU123'
        }
      ])
    ).toStrictEqual([
      {
        sku_list_id: 'LISTABC123',
        sku_id: 'SKU123'
      },
      {
        position: 4,
        quantity: 2,
        sku_list_id: 'LISTABC123',
        sku_id: 'SKU123'
      }
    ])
  })
})
