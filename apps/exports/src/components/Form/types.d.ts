declare module 'AppForm' {
  type ExportFormat = 'csv' | 'json'

  type FilterValue = string | number | Array<string | number> | null | boolean

  type Filters<FiltrableField extends string> = Partial<
    Record<FiltrableField, FilterValue>
  >

  // orders
  type OrdersFilters = Filters<OrdersField>
  type OrdersField =
    | 'market_id_in'
    | 'status_in'
    | 'created_at_gteq'
    | 'created_at_lteq'

  // order subscriptions
  type OrderSubscriptionsFilters = Filters<OrderSubscriptionField>
  type OrderSubscriptionField =
    | 'market_id_in'
    | 'status_in'
    | 'frequency_in'
    | 'created_at_gteq'
    | 'created_at_lteq'

  // skus
  type SkusFilters = Filters<SkusField>
  type SkusField =
    | 'code_in'
    | 'created_at_gteq'
    | 'created_at_lteq'
    | 'do_not_ship_false' // is shippable
    | 'shipping_category_id_in'

  // prices
  type PricesFilters = Filters<PricesField>
  type PricesField = 'sku_code_in' | 'price_list_id_eq'

  // stock_items
  type StockItemsFilters = Filters<StockItemsField>
  type StockItemsField = 'stock_location_id_in'

  type AllFilters = OrdersFilters &
    SkusFilters &
    PricesFilters &
    StockItemsFilters

  interface ExportFormValues {
    dryData: boolean
    includes: string[]
    format: ExportFormat
    filters?: AllFilters
  }
}
