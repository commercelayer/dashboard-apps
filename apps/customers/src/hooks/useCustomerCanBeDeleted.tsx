import { useTokenProvider } from '@commercelayer/app-elements'
import { useCustomerOrdersList } from './useCustomerOrdersList'

export function useCustomerCanBeDeleted(customerId: string): boolean {
  const { canUser } = useTokenProvider()
  const { orders } = useCustomerOrdersList({
    id: customerId,
    settings: { isFiltered: false }
  })

  const canBeDeleted = (orders ?? []).length === 0

  return canUser('destroy', 'customers') && canBeDeleted
}
