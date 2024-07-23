import { type LineItemCreate } from '@commercelayer/sdk'
import {
  csvTagsColumns,
  type CsvTagsColumn
} from '#components/InputParser/templates/_tags'

export const csvLineItemsTemplate: Array<
  keyof LineItemCreate | 'order_id' | CsvTagsColumn
> = ['order_id', 'quantity', ...csvTagsColumns]
