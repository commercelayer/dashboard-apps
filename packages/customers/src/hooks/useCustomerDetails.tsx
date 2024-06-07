import { isMockedId, makeCustomer } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
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
    [
      id,
      {
        include: [
          'customer_group',
          'customer_addresses',
          'customer_addresses.address',
          'customer_payment_sources',
          'customer_payment_sources.payment_source',

          // Timeline
          'attachments'
        ]
      }
    ],
    {
      isPaused: () => isMockedId(id),
      fallbackData: makeCustomer()
    }
  )

  return { customer, error, isLoading, mutateCustomer }
}
