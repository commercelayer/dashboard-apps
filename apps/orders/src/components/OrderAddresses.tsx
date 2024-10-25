import {
  ResourceAddress,
  Section,
  Stack,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()

    return (
      <Section border='none' title='Addresses'>
        <Stack>
          <ResourceAddress
            title='Billing address'
            address={order.billing_address}
            editable
            onCreate={(address) => {
              void sdkClient.orders.update({
                id: order.id,
                billing_address: {
                  type: 'addresses',
                  id: address.id
                }
              })
            }}
            showBillingInfo
            requiresBillingInfo={order.requires_billing_info ?? undefined}
          />
          <ResourceAddress
            title='Shipping address'
            address={order.shipping_address}
            editable
            onCreate={(address) => {
              void sdkClient.orders.update({
                id: order.id,
                shipping_address: {
                  type: 'addresses',
                  id: address.id
                }
              })
            }}
          />
        </Stack>
      </Section>
    )
  }
)
