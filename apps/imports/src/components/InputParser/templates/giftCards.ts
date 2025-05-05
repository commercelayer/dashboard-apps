import { type GiftCardCreate } from '@commercelayer/sdk'
import { type CsvTagsColumn, csvTagsColumns } from './_tags'

export const csvGiftCardsTemplate: Array<
  | keyof GiftCardCreate
  | 'market_id'
  | 'status'
  | 'gift_card_recipient_id'
  | CsvTagsColumn
> = [
  'code',
  'currency_code',
  'balance_cents',
  'balance_max_cents',
  'status',
  'single_use',
  'rechargeable',
  'distribute_discount',
  'image_url',
  'expires_at',
  'recipient_email',
  'reference',
  'reference_origin',
  'gift_card_recipient_id',
  'market_id',
  ...csvTagsColumns
]
