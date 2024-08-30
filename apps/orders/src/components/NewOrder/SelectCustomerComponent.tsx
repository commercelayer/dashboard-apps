import {
  HookedInputSelect,
  SkeletonTemplate,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { Customer, QueryParamsList } from '@commercelayer/sdk'
import { useFormContext } from 'react-hook-form'

export function SelectCustomerComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { watch } = useFormContext()

  const inputValue = watch('customer_email')

  const { data: customers, isLoading: isLoadingCustomers } = useCoreApi(
    'customers',
    'list',
    [
      {
        filters: {
          email_not_eq: inputValue
        }
      }
    ]
  )

  const { data: selectedCustomer, isLoading: isLoadingSelectedCustomer } =
    useCoreApi('customers', 'list', [
      {
        filters: {
          email_eq: inputValue
        }
      }
    ])

  const isLoading = isLoadingCustomers || isLoadingSelectedCustomer

  const initialValues = toInputSelectValues(
    selectedCustomer?.length === 1 ? selectedCustomer : []
  ).concat(toInputSelectValues(customers ?? []))

  return (
    <SkeletonTemplate isLoading={isLoading} delayMs={0}>
      <HookedInputSelect
        name='customer_email'
        label='Email *'
        placeholder='Search or add email'
        hint={{ text: "The customer's email for this order." }}
        isCreatable
        menuFooterText={
          customers != null && customers.meta.recordCount > 25
            ? 'Search or add email.'
            : undefined
        }
        initialValues={initialValues}
        loadAsyncValues={async (email) => {
          const customers = await sdkClient.customers.list(getParams({ email }))

          return toInputSelectValues(customers)
        }}
      />
    </SkeletonTemplate>
  )
}

function getParams({ email }: { email: string }): QueryParamsList<Customer> {
  return {
    pageSize: 25,
    sort: {
      email: 'asc'
    },
    filters: {
      email_cont: email
    }
  }
}

function toInputSelectValues(
  items: Array<{ email: string; id: string }>
): InputSelectValue[] {
  return items.map(({ email }) => ({
    label: email,
    value: email
  }))
}
