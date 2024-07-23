import { type CouponCreate } from '@commercelayer/sdk'
import {
  type CsvTagsColumn,
  csvTagsColumns
} from '#components/InputParser/templates/_tags'

export const csvCouponTemplate: Array<
  keyof CouponCreate | 'promotion_rule_id' | CsvTagsColumn
> = [
  'code',
  'usage_limit',
  'customer_single_use',
  'recipient_email',
  ...csvTagsColumns
]
