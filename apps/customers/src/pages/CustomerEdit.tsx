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
  useTokenProvider,
  useTranslation
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
  const { t } = useTranslation()

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
        title={t('common.edit_resource', {
          resource: t('resources.customers.name').toLowerCase()
        })}
        navigationButton={{
          label: t('common.back'),
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title={t('common.empty_states.not_found')}
          description={t('common.routes.invalid_resource_or_not_authorized')}
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>{t('common.go_back')}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {t('common.edit_resource', {
            resource: t('resources.customers.name').toLowerCase()
          })}
        </SkeletonTemplate>
      }
      navigationButton={{
        label: t('common.back'),
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

export default CustomerEdit
