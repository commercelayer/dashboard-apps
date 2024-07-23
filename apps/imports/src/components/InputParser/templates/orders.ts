import { type OrderCreate } from '@commercelayer/sdk'
import { type CsvTagsColumn, csvTagsColumns } from './_tags'

export const csvOrdersTemplate: Array<
  keyof OrderCreate | 'market_id' | CsvTagsColumn
> = [
  'autorefresh',
  'guest',
  'customer_email',
  'customer_password',
  'language_code',
  'shipping_country_code_lock',
  'coupon_code',
  'gift_card_code',
  'cart_url',
  'return_url',
  'terms_url',
  'privacy_url',
  ...csvTagsColumns
]
