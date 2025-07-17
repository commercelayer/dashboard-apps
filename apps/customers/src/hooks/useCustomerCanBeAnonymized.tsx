import { useTokenProvider } from '@commercelayer/app-elements'
import { useCustomerDetails } from './useCustomerDetails'

export function useCustomerCanBeAnonymized(customerId: string): boolean {
  const { canUser } = useTokenProvider()
  const { customer } = useCustomerDetails(customerId)

  const canBeAnonymized =
    customer?.anonymization_info != null &&
    customer.anonymization_info.status !== 'in_progress' &&
    customer.anonymization_info.status !== 'completed'

  return canUser('update', 'customers') && canBeAnonymized
}
