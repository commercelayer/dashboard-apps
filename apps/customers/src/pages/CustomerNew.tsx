import { CustomerForm, type CustomerFormValues } from '#components/CustomerForm'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type CustomerCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function CustomerNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath()

  if (!canUser('create', 'customers')) {
    return (
      <PageLayout
        title='New customer'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
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
      title={<>New customer</>}
      navigationButton={{
        label: 'Customers',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      overlay
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        <CustomerForm
          defaultValues={newCustomerToFormValues()}
          apiError={apiError}
          isSubmitting={isSaving}
          onSubmit={(formValues) => {
            setIsSaving(true)
            void sdkClient.customers
              .create(adaptFormValuesToCustomer(formValues))
              .then(() => {
                setLocation(goBackUrl)
              })
              .catch((error) => {
                setApiError(error)
                setIsSaving(false)
              })
          }}
        />
      </Spacer>
    </PageLayout>
  )
}

function newCustomerToFormValues(): CustomerFormValues {
  return {
    email: '',
    customerGroup: null
  }
}

function adaptFormValuesToCustomer(
  formValues: CustomerFormValues
): CustomerCreate {
  return {
    email: formValues.email,
    customer_group: {
      id: formValues.customerGroup ?? null,
      type: 'customer_groups'
    }
  }
}
