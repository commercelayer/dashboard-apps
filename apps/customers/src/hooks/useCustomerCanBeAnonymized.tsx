import { useTokenProvider } from '@commercelayer/app-elements'
import { useCustomerDetails } from './useCustomerDetails'

export function useCustomerCanBeAnonymized(customerId: string): boolean {
  const { canUser } = useTokenProvider()
  const { customer } = useCustomerDetails(customerId)

  // @ts-expect-error sdk types are not up to date
  const anonymizationInfo = customer.anonymization_info

  const canBeAnonymized =
    customer != null &&
    anonymizationInfo != null &&
    anonymizationInfo.status !== 'in_progress' &&
    anonymizationInfo.status !== 'completed'

  return canUser('update', 'customers') && canBeAnonymized
}
