import type { AddressCreate } from "@commercelayer/sdk"

export type CsvAddressColumn = `address.${keyof AddressCreate}`

export const csvAddressColumns: CsvAddressColumn[] = [
  "address.business",
  "address.first_name",
  "address.last_name",
  "address.company",
  "address.line_1",
  "address.line_2",
  "address.city",
  "address.zip_code",
  "address.state_code",
  "address.country_code",
  "address.phone",
  "address.email",
  "address.notes",
  "address.lat",
  "address.lng",
  "address.billing_info",
]
