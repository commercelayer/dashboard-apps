import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputSelect,
  HookedValidationApiError,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

import { useCustomerGroupsList } from '#hooks/useCustomerGroupsList'
import { fetchCustomerGroups } from '#utils/fetchCustomerGroups'

import type { CustomerGroup } from '@commercelayer/sdk'

const customerFormSchema = z.object({
  email: z.string().email(),
  customerGroup: z.string().nullable()
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

interface Props {
  defaultValues: CustomerFormValues
  isSubmitting: boolean
  onSubmit: (
    formValues: CustomerFormValues,
    setError: UseFormSetError<CustomerFormValues>
  ) => void
  apiError?: any
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(customerFormSchema)
  })

  const { customerGroups } = useCustomerGroupsList({})
  /*
   * `isLoadingCustomerGroups` is needed/wanted here because `isLoading` prop available from `useCoreApi` does not reflect with precision the fact that data is filled or not.
   * It might happen that `isLoading` is `false` and `customerGroups` is still `undefined` for a while.
   */
  const isLoadingCustomerGroups = customerGroups === undefined

  return (
    <HookedForm
      {...methods}
      onSubmit={(formValues) => {
        onSubmit(formValues, methods.setError)
      }}
    >
      <Spacer bottom='8'>
        <HookedInput
          name='email'
          label='Email'
          hint={{
            text: <Text variant='info'>The customer's email address</Text>
          }}
          autoComplete='off'
        />
      </Spacer>

      {!isLoadingCustomerGroups && (
        <Spacer bottom='8'>
          <Select options={customerGroups} />
        </Spacer>
      )}

      <Spacer top='14'>
        <Button
          type='submit'
          disabled={isSubmitting || isLoadingCustomerGroups}
          className='w-full'
        >
          {defaultValues.email.length === 0 ? 'Create' : 'Update'} customer
        </Button>
        <Spacer top='2'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}

function Select({ options }: { options: CustomerGroup[] }): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedInputSelect
      label='Group'
      name='customerGroup'
      initialValues={options.map(({ id, name }) => ({
        value: id,
        label: name
      }))}
      isClearable
      pathToValue='value'
      loadAsyncValues={async (hint) => {
        const list = await fetchCustomerGroups({ sdkClient, hint })
        return list.map(({ id, name }) => ({
          value: id,
          label: name
        }))
      }}
      hint={{
        text: (
          <Text variant='info'>The group to which this customer belongs</Text>
        )
      }}
    />
  )
}
