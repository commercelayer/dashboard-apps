import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { useCustomerOrdersList } from '#hooks/useCustomerOrdersList'
import {
  Button,
  PageLayout,
  useCoreSdkProvider,
  useOverlay,
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
  const [, setLocation] = useLocation()

  const { Overlay: DeleteOverlay, open, close } = useOverlay()
  const [isDeleteting, setIsDeleting] = useState(false)
  const { customer, isLoading } = useCustomerDetails(customerId)
  const { orders } = useCustomerOrdersList({
    id: customerId,
    settings: { isFiltered: false }
  })

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
        <a href='mailto:support@commercelayer.io'>support@commercelayer.io</a>.
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
                disabled={isDeleteting}
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
