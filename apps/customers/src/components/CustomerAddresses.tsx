import {
  Button,
  Icon,
  ListItem,
  PageLayout,
  ResourceAddress,
  Section,
  toast,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer, CustomerAddress } from '@commercelayer/sdk'
import { useState } from 'react'

interface Props {
  customer: Customer
  onRemovedAddress?: () => void
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({ customer, onRemovedAddress }): React.JSX.Element | null => {
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()
    const { t } = useTranslation()

    const { Overlay: DeleteOverlay, open, close } = useOverlay()
    const [isDeleting, setIsDeleting] = useState(false)
    const [addressSetForDeletion, setAddressSetForDeletion] =
      useState<CustomerAddress | null>(null)

    const addresses = customer.customer_addresses?.map(
      (customerAddress, idx) =>
        customerAddress?.address != null ? (
          <div key={idx} className='relative'>
            <ListItem>
              <ResourceAddress
                address={customerAddress?.address}
                editable={canUser('update', 'addresses')}
                showBillingInfo
              />
            </ListItem>
            {canUser('destroy', 'addresses') && (
              <div className='absolute right-0' style={{ bottom: '12px' }}>
                <button
                  onClick={() => {
                    setAddressSetForDeletion(customerAddress)
                    open()
                  }}
                >
                  <Icon name='trash' size={18} />
                </button>
              </div>
            )}
          </div>
        ) : null
    )

    if (addresses?.length === 0) return <></>

    return (
      <>
        <Section title={t('resources.addresses.name_other')}>
          {addresses}
        </Section>
        {canUser('destroy', 'addresses') && (
          <DeleteOverlay backgroundColor='light'>
            <PageLayout
              title={`Confirm that you want to delete the address for ${addressSetForDeletion?.address?.full_name}.`}
              description='This action cannot be undone, proceed with caution.'
              minHeight={false}
              navigationButton={{
                onClick: () => {
                  close()
                },
                label: `Cancel`,
                icon: 'x'
              }}
            >
              <Button
                variant='danger'
                size='small'
                disabled={isDeleting}
                onClick={(e) => {
                  setIsDeleting(true)
                  e.stopPropagation()
                  try {
                    void sdkClient.customer_addresses
                      .delete(addressSetForDeletion?.id ?? '')
                      .then(() => {
                        if (onRemovedAddress != null) {
                          onRemovedAddress()
                        }
                      })
                  } catch (error) {
                    const title: string | undefined = (error as any)
                      ?.errors?.[0]?.title
                    toast(title ?? 'An error occurred', { type: 'error' })
                  } finally {
                    setIsDeleting(false)
                    close()
                  }
                }}
                fullWidth
              >
                Delete address
              </Button>
            </PageLayout>
          </DeleteOverlay>
        )}
      </>
    )
  }
)
