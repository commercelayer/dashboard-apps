import {
  ResourceAddress,
  Section,
  Stack,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionAddresses = withSkeletonTemplate<Props>(
  ({ subscription }): JSX.Element | null => {
    const order = subscription.source_order

    return (
      <Section border='none' title='Addresses'>
        <Stack>
          <ResourceAddress
            title='Billing address'
            address={order?.billing_address}
            showBillingInfo
            requiresBillingInfo={order?.requires_billing_info ?? undefined}
          />
          <ResourceAddress
            title='Shipping address'
            address={order?.shipping_address}
          />
        </Stack>
      </Section>
    )
  }
)
