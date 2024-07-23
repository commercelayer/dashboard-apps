import { type PriceCreate } from '@commercelayer/sdk'

export const csvPricesTemplate: Array<
  | keyof PriceCreate
  | 'price_list_id'
  | 'price_tiers.type'
  | 'price_tiers.name'
  | 'price_tiers.up_to'
  | 'price_tiers.price_amount_cents'
> = [
  'amount_cents',
  'compare_at_amount_cents',
  'sku_code',
  'reference',
  'reference_origin',
  // price_tiers relationship
  'price_tiers.type',
  'price_tiers.name',
  'price_tiers.up_to',
  'price_tiers.price_amount_cents'
]
