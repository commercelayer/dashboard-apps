import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { useCustomerOrdersList } from '#hooks/useCustomerOrdersList'
import {
  Button,
  PageLayout,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
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
    ? `Confirm that you want to delete ${customer?.email}.`
    : `Customer cannot be deleted from our dashboard.`
  const deleteOverlayDescription: PageLayoutProps['description'] =
    canBeDeleted ? (
      'This action cannot be undone, proceed with caution.'
    ) : (
      <>
        Please send a request to{' '}
        <a
          href={encodeURI(
            `mailto:${customerDeletionMail.recipient}?subject=${customerDeletionMail.subject}&body=${customerDeletionMail.body}`
          )}
        >
          {customerDeletionMail.recipient}
        </a>{' '}
        specifying the organization name and the customer's email.
      </>
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
              label: `Cancel`,
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
                Delete customer
              </Button>
            )}
          </PageLayout>
        </DeleteOverlay>
      )
    }
  }
}
