import { type ImportCreate } from '@commercelayer/sdk'
import { type AllowedResourceType } from 'App'
import { type ZodSchema } from 'zod'

type ImportInputs = ImportCreate['inputs']

export const adapters: Record<
  AllowedResourceType,
  (csvSchema: ZodSchema[]) => ImportInputs
> = {
  addresses: (...args) => fromCsvSchemaToImportInputs(...args),
  bundles: (...args) => fromCsvSchemaToImportInputs(...args),
  customer_payment_sources: (...args) => fromCsvSchemaToImportInputs(...args),
  skus: (...args) => fromCsvSchemaToImportInputs(...args),
  sku_lists: (...args) => fromCsvSchemaToImportInputs(...args),
  sku_options: (...args) => fromCsvSchemaToImportInputs(...args),
  prices: (...args) => fromCsvSchemaToImportInputs(...args),
  coupons: (...args) => fromCsvSchemaToImportInputs(...args),
  gift_cards: (...args) => fromCsvSchemaToImportInputs(...args),
  customers: (...args) => fromCsvSchemaToImportInputs(...args),
  customer_subscriptions: (...args) => fromCsvSchemaToImportInputs(...args),
  tax_categories: (...args) => fromCsvSchemaToImportInputs(...args),
  stock_items: (...args) => fromCsvSchemaToImportInputs(...args),
  shipping_categories: (...args) => fromCsvSchemaToImportInputs(...args),
  orders: (...args) => fromCsvSchemaToImportInputs(...args),
  line_items: (...args) => fromCsvSchemaToImportInputs(...args),
  tags: (...args) => fromCsvSchemaToImportInputs(...args),
  sku_list_items: (...args) => fromCsvSchemaToImportInputs(...args)
}

const fromCsvSchemaToImportInputs = (csvSchema: ZodSchema[]): ImportInputs =>
  csvSchema
