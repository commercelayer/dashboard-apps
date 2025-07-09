import { type Market, type Order } from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'

type OrdersField = keyof Order | `market.${keyof Market}`
const orders: OrdersField[] = [
  'number',
  'status',
  'payment_status',
  'fulfillment_status',
  'customer_email',
  'coupon_code',
  'formatted_subtotal_amount',
  'formatted_shipping_amount',
  'formatted_payment_method_amount',
  'formatted_discount_amount',
  'formatted_total_tax_amount',
  'formatted_total_amount_with_taxes',
  'skus_count',
  'payment_source_details',
  'placed_at',
  'metadata',
  'market.id'
]

export const customFieldsSubset: Partial<
  Record<AllowedResourceType, string[]>
> = {
  orders
}
