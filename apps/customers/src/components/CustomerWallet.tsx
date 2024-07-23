import { PaymentMethod } from '#components/PaymentMethod'
import {
  Avatar,
  ListItem,
  Section,
  StatusIcon,
  withSkeletonTemplate,
  type AvatarProps
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
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

export const CustomerWallet = withSkeletonTemplate<Props>(({ customer }) => {
  const customerPaymentSources = customer?.customer_payment_sources?.map(
    (customerPaymentSource, idx) => {
      const paymentSource = customerPaymentSource.payment_source
      // console.log(paymentSource)
      const avatarSrc = getAvatarSrc(paymentSource?.type)
      const icon =
        avatarSrc != null ? (
          <Avatar
            src={avatarSrc}
            alt={paymentSource?.order?.payment_method?.name ?? ''}
            shape='circle'
            size='small'
          />
        ) : (
          <StatusIcon name='creditCard' background='teal' gap='large' />
        )

      return (
        <ListItem icon={icon} key={idx}>
          <PaymentMethod customerPaymentSource={customerPaymentSource} />
        </ListItem>
      )
    }
  )

  if (customerPaymentSources?.length === 0) return <></>

  return <Section title='Wallet'>{customerPaymentSources}</Section>
})
