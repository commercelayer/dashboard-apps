import { type ShippingCategoryCreate } from '@commercelayer/sdk'

export const csvShippingCategoryTemplate: Array<keyof ShippingCategoryCreate> =
  ['name', 'reference', 'reference_origin']
