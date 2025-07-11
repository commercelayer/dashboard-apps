import { type AllowedResourceType } from 'App'
import { type AllFilters } from 'AppForm'
import { Coupons } from './Coupons'
import { InStockSubscriptions } from './InStockSubscriptions'
import { Orders } from './Orders'
import { OrderSubscriptions } from './OrderSubscriptions'
import { Prices } from './Prices'
import { Returns } from './Returns'
import { Skus } from './Skus'
import { StockItems } from './StockItems'

interface Props {
  resourceType: AllowedResourceType
  onChange: (filters: AllFilters) => void
}

export const resourcesWithFilters = [
  'in_stock_subscriptions',
  'order_subscriptions',
  'orders',
  'prices',
  'coupons',
  'returns',
  'skus',
  'stock_items'
]

export function Filters({
  resourceType,
  onChange
}: Props): React.JSX.Element | null {
  if (resourceType === 'orders') {
    return <Orders onChange={onChange} />
  }

  if (resourceType === 'returns') {
    return <Returns onChange={onChange} />
  }

  if (resourceType === 'in_stock_subscriptions') {
    return <InStockSubscriptions onChange={onChange} />
  }

  if (resourceType === 'order_subscriptions') {
    return <OrderSubscriptions onChange={onChange} />
  }

  if (resourceType === 'skus') {
    return <Skus onChange={onChange} />
  }

  if (resourceType === 'prices') {
    return <Prices onChange={onChange} />
  }

  if (resourceType === 'coupons') {
    return <Coupons onChange={onChange} />
  }

  if (resourceType === 'stock_items') {
    return <StockItems onChange={onChange} />
  }

  return null
}
