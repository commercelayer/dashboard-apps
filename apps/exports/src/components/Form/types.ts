export type ExportFormat = 'csv' | 'json'

export type FilterValue =
  | string
  | number
  | Array<string | number>
  | null
  | boolean

export type Filters<FiltrableField extends string> = Partial<
  Record<FiltrableField, FilterValue>
>

// orders
export type OrdersFilters = Filters<OrdersField>
export type OrdersField =
  | 'market_id_in'
  | 'status_in'
  | 'payment_status_in'
  | 'fulfillment_status_in'
  | 'tags_id_in'
  | 'placed_at_gteq'
  | 'placed_at_lteq'

// in_stock_subscriptions
export type InStockSubscriptionsFilters = Filters<InStockSubscriptionsField>
export type InStockSubscriptionsField =
  | 'status_in'
  | 'created_at_gteq'
  | 'created_at_lteq'

// returns
export type ReturnsFilters = Filters<ReturnsField>
export type ReturnsField = 'status_in' | 'created_at_gteq' | 'created_at_lteq'

// order subscriptions
export type OrderSubscriptionsFilters = Filters<OrderSubscriptionField>
export type OrderSubscriptionField =
  | 'market_id_in'
  | 'status_in'
  | 'frequency_in'
  | 'created_at_gteq'
  | 'created_at_lteq'

// skus
export type SkusFilters = Filters<SkusField>
export type SkusField =
  | 'code_in'
  | 'created_at_gteq'
  | 'created_at_lteq'
  | 'do_not_ship_false' // is shippable
  | 'shipping_category_id_in'

// prices
export type PricesFilters = Filters<PricesField>
export type PricesField = 'sku_code_in' | 'price_list_id_eq'

// coupons
export type CouponsFilters = Filters<CouponsField>
export type CouponsField = 'promotion_rule_promotion_id_eq'

// stock_items
export type StockItemsFilters = Filters<StockItemsField>
export type StockItemsField = 'stock_location_id_in'

export type AllFilters = OrdersFilters &
  SkusFilters &
  PricesFilters &
  CouponsFilters &
  StockItemsFilters

export interface ExportFormValues {
  dryData: boolean
  includes: string[]
  format: ExportFormat
  filters?: AllFilters
  useCustomFields?: boolean
}
