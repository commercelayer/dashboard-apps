import {
  ResourceAddress,
  Section,
  Stack,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    if (order.shipping_address == null && order.billing_address == null) {
      return null
    }

    return (
      <Section border='none' title='Addresses'>
        <Stack>
          {order.billing_address != null && (
            <ResourceAddress
              title='Billing address'
              resource={order.billing_address}
              showBillingInfo
              editable
            />
          )}
          {order.shipping_address != null && (
            <ResourceAddress
              title='Shipping address'
              resource={order.shipping_address}
              editable
            />
          )}
        </Stack>
      </Section>
    )
  }
)
