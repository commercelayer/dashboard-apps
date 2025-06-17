import { makeCustomer } from '#mocks'
import { isMockedId, useCoreApi } from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useCustomerDetails(id: string): {
  customer: Customer
  isLoading: boolean
  error: any
  mutateCustomer: KeyedMutator<Customer>
} {
  const {
    data: customer,
    isLoading,
    error,
    mutate: mutateCustomer
  } = useCoreApi(
    'customers',
    'retrieve',
    !isMockedId(id)
      ? [
          id,
          {
            include: [
              'customer_group',
              'customer_addresses',
              'customer_addresses.address',
              'customer_payment_sources',
              'customer_payment_sources.payment_source',
              'customer_subscriptions',
              // Timeline
              'attachments'
            ]
          }
        ]
      : null,
    {
      fallbackData: makeCustomer()
    }
  )

  return { customer, error, isLoading, mutateCustomer }
}
