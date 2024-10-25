import { hasPaymentMethod } from '#utils/order'
import {
  ResourcePaymentMethod,
  Section,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  if (!hasPaymentMethod(order) || order.payment_status === 'free') {
    return null
  }

  return (
    <Section title='Payment method' border='none'>
      <ResourcePaymentMethod resource={order} showPaymentResponse />
    </Section>
  )
})
