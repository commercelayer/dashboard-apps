import { type CustomerCreate } from '@commercelayer/sdk'
import { type CsvTagsColumn, csvTagsColumns } from './_tags'

export const csvCustomersTemplate: Array<
  keyof CustomerCreate | 'customer_group_id' | CsvTagsColumn
> = ['email', 'password', 'customer_group_id', ...csvTagsColumns]
