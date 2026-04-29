import { type CsvAddressColumn, csvAddressColumns } from "./_address"

export const csvCustomerAddressesTemplate: Array<
  "customer.email" | "address.id" | CsvAddressColumn
> = ["customer.email", ...csvAddressColumns, "address.id"]
