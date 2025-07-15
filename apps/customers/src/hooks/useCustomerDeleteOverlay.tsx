import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
  Button,
  PageLayout,
  useCoreSdkProvider,
  useOverlay,
  useTranslation,
  type PageLayoutProps
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { useCustomerCanBeAnonymized } from './useCustomerCanBeAnonymized'
import { useCustomerCanBeDeleted } from './useCustomerCanBeDeleted'

interface OverlayHook {
  show: () => void
  DeleteOverlay: React.FC
}

export function useCustomerDeleteOverlay(customerId: string): OverlayHook {
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const { Overlay: DeleteOverlay, open, close } = useOverlay()
  const [isDeleting, setIsDeleting] = useState(false)
  const { customer, isLoading, mutateCustomer } = useCustomerDetails(customerId)
  const canBeDeleted = useCustomerCanBeDeleted(customerId)
  const canBeAnonymized = useCustomerCanBeAnonymized(customerId)
  const deleteOverlayTitle: PageLayoutProps['title'] = canBeDeleted
    ? t('apps.customers.details.confirm_customer_delete', {
        email: customer?.email ?? ''
      })
    : t('apps.customers.anonymize.title')
  const deleteOverlayDescription: PageLayoutProps['description'] = canBeDeleted
    ? t('apps.orders.details.irreversible_action')
    : t('apps.customers.anonymize.description')

  return {
    show: () => {
      open()
    },
    DeleteOverlay: () => {
      return canBeDeleted || canBeAnonymized ? (
        <DeleteOverlay backgroundColor='light'>
          <PageLayout
            title={deleteOverlayTitle}
            description={deleteOverlayDescription}
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: t('common.cancel'),
              icon: 'x'
            }}
            isLoading={isLoading}
          >
            {canBeDeleted ? (
              <Button
                variant='danger'
                size='small'
                disabled={isDeleting}
                onClick={(e) => {
                  setIsDeleting(true)
                  e.stopPropagation()
                  void sdkClient.customers
                    .delete(customer.id)
                    .then(() => {
                      setLocation(appRoutes.list.makePath())
                    })
                    .catch(() => {})
                }}
                fullWidth
              >
                {t('common.delete_resource', {
                  resource: t('resources.customers.name').toLowerCase()
                })}
              </Button>
            ) : (
              <Button
                variant='danger'
                size='small'
                disabled={isDeleting}
                onClick={(e) => {
                  setIsDeleting(true)
                  e.stopPropagation()
                  void sdkClient.customers
                    .update({
                      id: customer.id,
                      _request_anonymization: true
                    })
                    .then(() => {
                      void mutateCustomer().then(() => {
                        close()
                      })
                    })
                    .catch(() => {})
                }}
                fullWidth
              >
                {t('apps.customers.anonymize.request_button')}
              </Button>
            )}
          </PageLayout>
        </DeleteOverlay>
      ) : null
    }
  }
}
