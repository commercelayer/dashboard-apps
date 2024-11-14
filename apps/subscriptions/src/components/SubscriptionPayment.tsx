import {
  ResourcePaymentMethod,
  Section,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionPayment = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    if (subscription.customer_payment_source?.payment_source == null) {
      return null
    }

    return (
      <Section title='Payment method' border='none'>
        <ResourcePaymentMethod
          // @ts-expect-error type mismatch for CustomerPaymentSource resource
          resource={subscription.customer_payment_source}
          showPaymentResponse
        />
      </Section>
    )
  }
)
