import { csvSkuListSchema } from './skuLists'

describe('Validate csvSkuListSchema', () => {
  test('received input should have a valid Sku Lists schema', () => {
    expect(
      csvSkuListSchema.parse([
        {
          name: 'LIST-01',
          description: 'Some text...',
          image_url: 'http://....',
          manual: true
        },
        {
          name: 'LIST-02',
          description: 'Some text...',
          image_url: 'http://....',
          manual: false,
          sku_code_regex: '^(A|B).*$'
        }
      ])
    ).toStrictEqual([
      {
        name: 'LIST-01',
        description: 'Some text...',
        image_url: 'http://....',
        manual: true
      },
      {
        name: 'LIST-02',
        description: 'Some text...',
        image_url: 'http://....',
        manual: false,
        sku_code_regex: '^(A|B).*$'
      }
    ])
  })

  test('should accept flatten sku_list_items.sku_code', () => {
    expect(
      csvSkuListSchema.parse([
        {
          name: 'LIST-01',
          description: 'Some text...',
          image_url: 'http://....',
          manual: true,
          'sku_list_items.sku_code': 'sku01'
        },
        {
          name: 'LIST-01',
          description: 'Some text...',
          image_url: 'http://....',
          manual: true,
          'sku_list_items.sku_code': 'sku02'
        },
        {
          name: 'LIST-01',
          description: 'Some text...',
          image_url: 'http://....',
          manual: true,
          'sku_list_items.sku_code': 'sku03'
        }
      ])
    ).toStrictEqual([
      {
        name: 'LIST-01',
        description: 'Some text...',
        image_url: 'http://....',
        manual: true,
        'sku_list_items.sku_code': 'sku01'
      },
      {
        name: 'LIST-01',
        description: 'Some text...',
        image_url: 'http://....',
        manual: true,
        'sku_list_items.sku_code': 'sku02'
      },
      {
        name: 'LIST-01',
        description: 'Some text...',
        image_url: 'http://....',
        manual: true,
        'sku_list_items.sku_code': 'sku03'
      }
    ])
  })
})
