import { csvAddressColumns, type CsvAddressColumn } from './_address'

export const csvCustomerAddressesTemplate: Array<
  'customer.email' | 'address.id' | CsvAddressColumn
> = ['customer.email', ...csvAddressColumns, 'address.id']
