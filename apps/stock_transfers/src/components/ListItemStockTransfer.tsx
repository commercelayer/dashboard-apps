import { makeStockTransfer } from '#mocks'
import { ResourceListItem, navigateTo } from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: StockTransfer
  isLoading?: boolean
  delayMs?: number
}

export function ListItemStockTransfer({
  resource = makeStockTransfer(),
  isLoading,
  delayMs
}: Props): JSX.Element {
  const [, setLocation] = useLocation()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'stock_transfers',
          resourceId: resource.id
        }
      })}
    />
  )
}
