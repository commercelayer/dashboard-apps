/*
To Do:
1. How to handle error in handler? We have setApiError(error), but how to use this on front end?
*/

import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
    Alert,
    Button,
    Icon,
    ListItem,
    PageLayout,
    ResourceAddress,
    Section,
    Spacer,
    useCoreSdkProvider,
    useOverlay,
    withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer, Order } from '@commercelayer/sdk'
import { useState } from 'react'

interface Props {
  order: Order
  onChange?: () => void
  close: () => void
}
interface PropsAddresses {
  customer: Customer
  orderId: string
  close: () => void
  onChange?: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCustomerAddressOverlay(
  order: Props['order'],
  onChange?: Props['onChange']
) {
  const { Overlay, open, close } = useOverlay()
  const customerId = order?.customer?.id ?? ''
  // console.log('customer', customerId)
  const { customer } = useCustomerDetails(customerId)
  // console.log('customer', customer)
  return {
    close,
    open,
    Overlay: () => (
      <Overlay>
        <PageLayout
          title='Assign Address'
          navigationButton={{
            onClick: () => {
              close()
            },
            label: 'Cancel',
            icon: 'x'
          }}
        >
          <CustomerAddresses
            customer={customer}
            orderId={order?.id}
            close={close}
            onChange={onChange}
          />
        </PageLayout>
      </Overlay>
    )
  }
}

const CustomerAddresses = withSkeletonTemplate<PropsAddresses>(
  ({ customer, orderId, close, onChange }): JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()
    const [apiError, setApiError] = useState<string>()
    const handleSubmitAddress = async (
      id: string | null,
      billing: boolean
    ): Promise<void> => {
      if (id === null) {
        close()
      }
      // if billing is true, update billing, if false, update shipping
      billing
        ? await sdkClient.orders
            .update({
              id: orderId,
              billing_address: sdkClient.addresses.relationship(id)
            })
            .then(() => {
              onChange?.()
              close()
            })
            .catch((error) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              setApiError(error)
            })
        : await sdkClient.orders
            .update({
              id: orderId,
              shipping_address: sdkClient.addresses.relationship(id)
            })
            .then(() => {
              onChange?.()
              close()
            })
            .catch((error) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              setApiError(error)
            })
    }

    const addresses = customer.customer_addresses?.map(
      (customerAddress, idx) =>
        customerAddress?.address != null ? (
          <ListItem key={idx}>
            <div className='flex flex-col'>
              {' '}
              <Button
                alignItems='center'
                variant='secondary'
                size='mini'
                onClick={() => {
                  void (async () => {
                    await handleSubmitAddress(
                      customerAddress?.address?.id ?? null,
                      true
                    )
                  })()
                }}
                style={{ width: '12rem' }} // Inline style for custom width
              >
                <Icon name='bank' />
                Use for Billing
              </Button>
              <Spacer bottom='10' />
              <Button
                alignItems='center'
                variant='secondary'
                size='mini'
                onClick={() => {
                  void (async () => {
                    await handleSubmitAddress(
                      customerAddress?.address?.id ?? null,
                      false
                    )
                  })()
                }}
                style={{ width: '12rem' }} // Inline style for custom width
              >
                <Icon name='buildings' />
                Use for Shipping
              </Button>
            </div>
            <ResourceAddress
              address={customerAddress?.address}
              // editable={canUser('update', 'addresses')}
              showBillingInfo
            />
          </ListItem>
        ) : null
    )

    if (addresses?.length === 0)
      return (
        <>
          <Alert status='warning'>
            This customer does not have any addresses yet. Please go to the
            customer app to create an address.
          </Alert>
        </>
      )

    return <Section title='Addresses'>{addresses}</Section>
  }
)
