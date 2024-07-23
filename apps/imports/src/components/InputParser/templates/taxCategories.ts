import { type TaxCategoryCreate } from '@commercelayer/sdk'

export const csvTaxCategoryTemplate: Array<
  keyof TaxCategoryCreate | 'tax_calculator_id'
> = ['sku_code', 'reference', 'reference_origin']
