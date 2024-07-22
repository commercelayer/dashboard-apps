import { PaymentMethod } from '#components/PaymentMethod'
import type { AvatarProps } from '@commercelayer/app-elements'
import {
  Avatar,
  ListItem,
  Section,
  StatusIcon,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { hasPaymentMethod } from './PaymentMethod'

interface Props {
  order: Order
}

function getAvatarSrc(
  paymentType: string | null | undefined
): AvatarProps['src'] | undefined {
  switch (paymentType) {
    case 'adyen_payments':
      return 'payments:adyen'
    case 'axerve_payments':
      return 'payments:axerve'
    case 'braintree_payments':
      return 'payments:braintree'
    case 'checkout_com_payments':
      return 'payments:checkout'
    case 'klarna_payments':
      return 'payments:klarna'
    case 'paypal_payments':
      return 'payments:paypal'
    case 'satispay_payments':
      return 'payments:satispay'
    case 'stripe_payments':
      return 'payments:stripe'
    default:
      return undefined
  }
}

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  const avatarSrc = getAvatarSrc(order.payment_method?.payment_source_type)
  const icon =
    avatarSrc != null ? (
      <Avatar
        src={avatarSrc}
        alt={order.payment_method?.name ?? ''}
        shape='circle'
        size='small'
      />
    ) : (
      <StatusIcon name='creditCard' background='teal' gap='large' />
    )

  if (!hasPaymentMethod(order) || order.payment_status === 'free') {
    return null
  }

  return (
    <Section title='Payment method'>
      <ListItem icon={icon}>
        <PaymentMethod order={order} />
      </ListItem>
    </Section>
  )
})
