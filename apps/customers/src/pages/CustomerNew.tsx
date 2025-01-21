import { CustomerForm, type CustomerFormValues } from '#components/CustomerForm'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { type CustomerCreate } from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function CustomerNew(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl = appRoutes.list.makePath()
  const pageTitle = t('common.new_resource', {
    resource: t('resources.customers.name').toLowerCase()
  })

  if (!canUser('create', 'customers')) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
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
      title={<>{pageTitle}</>}
      navigationButton={{
        label: t('resources.customers.name_other'),
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

export default CustomerNew
