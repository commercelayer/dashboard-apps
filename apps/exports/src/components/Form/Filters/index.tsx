import { type AllowedResourceType } from 'App'
import { type AllFilters } from 'AppForm'
import { Orders } from './Orders'
import { OrderSubscriptions } from './OrderSubscriptions'
import { Prices } from './Prices'
import { Skus } from './Skus'
import { StockItems } from './StockItems'

interface Props {
  resourceType: AllowedResourceType
  onChange: (filters: AllFilters) => void
}

export const resourcesWithFilters = [
  'orders',
  'order_subscriptions',
  'skus',
  'prices',
  'stock_items'
]

export function Filters({
  resourceType,
  onChange
}: Props): React.JSX.Element | null {
  if (resourceType === 'orders') {
    return <Orders onChange={onChange} />
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

  if (resourceType === 'stock_items') {
    return <StockItems onChange={onChange} />
  }

  return null
}
