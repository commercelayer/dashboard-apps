import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { useCustomerOrdersList } from '#hooks/useCustomerOrdersList'
import {
  Button,
  PageLayout,
  Trans,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  useTranslation,
  type PageLayoutProps
} from '@commercelayer/app-elements'
import { useMemo, useState } from 'react'
import { useLocation } from 'wouter'

interface OverlayHook {
  show: () => void
  DeleteOverlay: React.FC
}

export function useCustomerDeleteOverlay(customerId: string): OverlayHook {
  const { sdkClient } = useCoreSdkProvider()
  const { organization } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const { Overlay: DeleteOverlay, open, close } = useOverlay()
  const [isDeleting, setIsDeleting] = useState(false)
  const { customer, isLoading } = useCustomerDetails(customerId)
  const { orders } = useCustomerOrdersList({
    id: customerId,
    settings: { isFiltered: false }
  })

  const customerDeletionMail = {
    recipient: 'support@commercelayer.io',
    subject: `Anonymize customer ${customer.email}`,
    body: `Anonymization request for customer ${customer.email} of organization ${organization?.name}`
  }

  const canBeDeleted = useMemo(() => {
    return orders == null || orders.length === 0
  }, [orders])
  const deleteOverlayTitle: PageLayoutProps['title'] = canBeDeleted
    ? t('apps.customers.details.confirm_customer_delete', {
        email: customer?.email ?? ''
      })
    : t('apps.customers.details.customer_cannot_be_deleted')
  const deleteOverlayDescription: PageLayoutProps['description'] =
    canBeDeleted ? (
      t('apps.orders.details.irreversible_action')
    ) : (
      <Trans
        i18nKey='apps.customers.details.customer_cannot_be_deleted_description'
        components={{
          a: (
            <a
              href={encodeURI(
                `mailto:${customerDeletionMail.recipient}?subject=${customerDeletionMail.subject}&body=${customerDeletionMail.body}`
              )}
            >
              {customerDeletionMail.recipient}
            </a>
          )
        }}
        values={{
          support_email: customerDeletionMail.recipient
        }}
      />
    )

  return {
    show: () => {
      open()
    },
    DeleteOverlay: () => {
      return (
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
            {canBeDeleted && (
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
            )}
          </PageLayout>
        </DeleteOverlay>
      )
    }
  }
}
