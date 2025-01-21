import { makeStockTransfer } from '#mocks'
import { ResourceListItem, useAppLinking } from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

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
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        app: 'stock_transfers',
        resourceId: resource.id
      })}
    />
  )
}
