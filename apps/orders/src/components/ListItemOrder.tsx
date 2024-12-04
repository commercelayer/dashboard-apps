import { makeOrder } from '#mocks'
import {
  ResourceListItem,
  formatCentsToCurrency,
  useAppLinking,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  resource?: Order
  isLoading?: boolean
  delayMs?: number
}

export function ListItemOrder({
  resource = makeOrder(),
  isLoading,
  delayMs
}: Props): JSX.Element {
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={{
        ...resource,
        formatted_total_amount: getFormattedTotalAmount(resource)
      }}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        app: 'orders',
        resourceId: resource.id
      })}
    />
  )
}

/**
 * This helper aims to get `formatted_total_amount` from a metrics `Order`.
 */
function getFormattedTotalAmount(resource: Order): string | null | undefined {
  if ('total_amount' in resource && resource.currency_code != null) {
    return formatCentsToCurrency(
      (resource.total_amount as number) * 100,
      resource.currency_code as CurrencyCode
    )
  }

  return resource.formatted_total_amount
}
