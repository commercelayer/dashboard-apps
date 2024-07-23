/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { CustomerForm, type CustomerFormValues } from '#components/CustomerForm'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Customer, type CustomerUpdate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function CustomerEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.edit.path)
  const customerId = params?.customerId ?? ''

  const { customer, isLoading, mutateCustomer } = useCustomerDetails(customerId)
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl =
    customerId != null
      ? appRoutes.details.makePath(customerId)
      : appRoutes.list.makePath()

  if (!canUser('update', 'customers')) {
    return (
      <PageLayout
        title='Edit customer'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title='Not found'
          description='Customer is invalid or you are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>Edit customer</SkeletonTemplate>
      }
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      overlay
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        {!isLoading && customer != null ? (
          <CustomerForm
            defaultValues={adaptCustomerToFormValues(customer)}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.customers
                .update(adaptFormValuesToCustomer(formValues, customer.id))
                .then((updatedCustomer) => {
                  setLocation(goBackUrl)
                  void mutateCustomer({ ...updatedCustomer })
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptCustomerToFormValues(customer?: Customer): CustomerFormValues {
  return {
    email: customer?.email ?? '',
    customerGroup: customer?.customer_group?.id ?? null
  }
}

function adaptFormValuesToCustomer(
  formValues: CustomerFormValues,
  customerId: string
): CustomerUpdate {
  return {
    id: customerId,
    email: formValues.email,
    customer_group: {
      id: formValues.customerGroup ?? null,
      type: 'customer_groups'
    }
  }
}
