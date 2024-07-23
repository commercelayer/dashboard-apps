import { type AddressCreate } from '@commercelayer/sdk'
import {
  type CsvTagsColumn,
  csvTagsColumns
} from '#components/InputParser/templates/_tags'

export const csvAddressTemplate: Array<keyof AddressCreate | CsvTagsColumn> = [
  'business',
  'first_name',
  'last_name',
  'company',
  'line_1',
  'line_2',
  'city',
  'zip_code',
  'state_code',
  'country_code',
  'phone',
  'email',
  'notes',
  'lat',
  'lng',
  'billing_info',
  ...csvTagsColumns
]
