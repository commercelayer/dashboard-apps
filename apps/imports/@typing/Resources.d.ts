declare module 'App' {
  export type AllowedResourceType =
    | 'skus'
    | 'sku_lists'
    | 'prices'
    | 'coupons'
    | 'gift_cards'
    | 'customers'
    | 'customer_subscriptions'
    | 'customer_payment_sources'
    | 'tax_categories'
    | 'stock_items'
    | 'addresses'
    | 'bundles'
    | 'shipping_categories'
    | 'sku_options'
    | 'orders'
    | 'line_items'
    | 'tags'
    | 'sku_list_items'

  export type ResourceWithParent =
    | 'bundles'
    | 'coupons'
    | 'orders'
    | 'prices'
    | 'sku_options'
    | 'sku_list_items'
    | 'stock_items'
    | 'tax_categories'

  export type AllowedParentResource =
    | 'markets'
    | 'promotions'
    | 'price_lists'
    | 'stock_locations'
    | 'tax_calculators'
    | 'sku_lists'
}
