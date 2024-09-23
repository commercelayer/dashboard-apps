import {
  HookedInputSelect,
  SkeletonTemplate,
  useCoreApi,
  useCoreSdkProvider,
  type HookedInputSelectProps,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type {
  Customer,
  ListResponse,
  QueryParamsList
} from '@commercelayer/sdk'
import { useState, type FC } from 'react'
import { useFormContext } from 'react-hook-form'

type SelectCustomerProps = Pick<
  HookedInputSelectProps,
  'name' | 'label' | 'hint' | 'isClearable'
>

export const SelectCustomer: FC<SelectCustomerProps> = ({
  label,
  hint,
  isClearable,
  name
}) => {
  const { sdkClient } = useCoreSdkProvider()
  const { watch } = useFormContext()
  const [inputOptions, setInputOptions] = useState<ListResponse<Customer>>()

  const inputValue: string | undefined | null = watch(name)

  const { data: customers, isLoading: isLoadingCustomers } = useCoreApi(
    'customers',
    'list',
    [
      {
        filters:
          inputValue == null
            ? {}
            : {
                email_not_eq: inputValue
              }
      }
    ]
  )

  const { data: selectedCustomer, isLoading: isLoadingSelectedCustomer } =
    useCoreApi('customers', 'list', [
      {
        filters:
          inputValue == null
            ? {}
            : {
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
        name={name}
        label={label}
        placeholder='Search or add email'
        hint={hint}
        isClearable={isClearable}
        isCreatable
        menuFooterText={
          (inputOptions == null &&
            customers != null &&
            customers.meta.recordCount > 25) ||
          (inputOptions?.meta.recordCount ?? 0) > 25
            ? 'Type to search for more options.'
            : undefined
        }
        initialValues={initialValues}
        loadAsyncValues={async (email) => {
          const customers = await sdkClient.customers.list(getParams({ email }))
          setInputOptions(customers)
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
