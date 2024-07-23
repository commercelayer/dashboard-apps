import { csvTaxCategoriesSchema } from './taxCategories'

describe('Validate csvTaxCategoriesSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvTaxCategoriesSchema.parse([
        {
          sku_id: 'ABC',
          tax_calculator_id: 'ABC123'
        },
        {
          sku_code: 'ABC000',
          sku_id: 'ABC000',
          tax_calculator_id: 'ABC123'
        },
        {
          sku_code: 'XYZ987',
          tax_calculator_id: 'ABC123'
        }
      ])
    ).toStrictEqual([
      {
        sku_id: 'ABC',
        tax_calculator_id: 'ABC123'
      },
      {
        sku_code: 'ABC000',
        sku_id: 'ABC000',
        tax_calculator_id: 'ABC123'
      },
      {
        sku_code: 'XYZ987',
        tax_calculator_id: 'ABC123'
      }
    ])
  })
})
