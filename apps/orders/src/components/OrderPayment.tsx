import { hasPaymentMethod } from '#utils/order'
import {
  ResourcePaymentMethod,
  Section,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  const { t } = useTranslation()
  if (!hasPaymentMethod(order) || order.payment_status === 'free') {
    return null
  }

  return (
    <Section title={t('apps.orders.details.payment_method')} border='none'>
      <ResourcePaymentMethod resource={order} showPaymentResponse />
    </Section>
  )
})
