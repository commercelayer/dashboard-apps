import { type AllowedResourceType } from 'App'
import { csvAddressTemplate } from './address'
import { csvBundleTemplate } from './bundle'
import { csvCouponTemplate } from './coupon'
import { csvCustomersTemplate } from './customers'
import { csvCustomerSubscriptionsTemplate } from './customerSubscriptions'
import { csvGiftCardsTemplate } from './giftCards'
import { csvOrdersTemplate } from './orders'
import { csvPricesTemplate } from './prices'
import { csvShippingCategoryTemplate } from './shippingCategory'
import { csvSkuListTemplate } from './skuLists'
import { csvSkuOptionTemplate } from './skuOptions'
import { csvSkusTemplate } from './skus'
import { csvStockItemTemplate } from './stockItems'
import { csvTaxCategoryTemplate } from './taxCategories'
import { csvLineItemsTemplate } from './lineItems'
import { csvTagsTemplate } from './tags'
import { csvSkuListItemsTemplate } from './skuListItems'
import { csvCustomerPaymentSourcesTemplate } from './customerPaymentSources'

const templates: Record<AllowedResourceType, string[]> = {
  addresses: csvAddressTemplate,
  bundles: csvBundleTemplate,
  skus: csvSkusTemplate,
  prices: csvPricesTemplate,
  coupons: csvCouponTemplate,
  sku_lists: csvSkuListTemplate,
  sku_options: csvSkuOptionTemplate,
  gift_cards: csvGiftCardsTemplate,
  customers: csvCustomersTemplate,
  customer_payment_sources: csvCustomerPaymentSourcesTemplate,
  customer_subscriptions: csvCustomerSubscriptionsTemplate,
  tax_categories: csvTaxCategoryTemplate,
  stock_items: csvStockItemTemplate,
  shipping_categories: csvShippingCategoryTemplate,
  orders: csvOrdersTemplate,
  line_items: csvLineItemsTemplate,
  tags: csvTagsTemplate,
  sku_list_items: csvSkuListItemsTemplate
}

export function downloadTemplateAsCsvFile({
  resourceType
}: {
  resourceType: AllowedResourceType
}): void {
  const fields = templates[resourceType]
  if (fields == null || fields.length === 0) {
    return
  }

  const dataUri = 'data:text/csv;charset=utf-8,' + fields.join(',')
  const tag = document.createElement('a')
  tag.setAttribute('href', dataUri)
  tag.setAttribute('download', `${resourceType}_template.csv`)
  document.body.appendChild(tag)
  tag.click()
  tag.remove()
}
