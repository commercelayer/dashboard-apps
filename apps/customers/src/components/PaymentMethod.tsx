import { Spacer, Text } from '@commercelayer/app-elements'
import { type CustomerPaymentSource } from '@commercelayer/sdk'
import { z } from 'zod'

interface Props {
  customerPaymentSource: CustomerPaymentSource
}

function getPaymentMethodName(
  paymentType: string | null | undefined
): string | undefined {
  switch (paymentType) {
    case 'adyen_payments':
      return 'Adyen'
    case 'axerve_payments':
      return 'Axerve'
    case 'braintree_payments':
      return 'Braintree'
    case 'checkout_com_payments':
      return 'Checkout.com'
    case 'klarna_payments':
      return 'Klarna'
    case 'paypal_payments':
      return 'Paypal'
    case 'satispay_payments':
      return 'Satispay'
    case 'stripe_payments':
      return 'Stripe'
    default:
      return undefined
  }
}

export function PaymentMethod({ customerPaymentSource }: Props): JSX.Element {
  const paymentInstrument = paymentInstrumentType.safeParse(
    customerPaymentSource.payment_source?.payment_instrument
  )

  const paymentMethods = paymentMethodsType.safeParse(
    // @ts-expect-error At the moment 'payment_methods' does not exist on type 'AxervePayment'.
    customerPaymentSource.payment_source?.payment_methods
  )

  const paymentMethodName = paymentMethods.success
    ? paymentMethods.data.paymentMethods[0]?.name
    : getPaymentMethodName(customerPaymentSource.payment_source?.type)

  return paymentInstrument.success ? (
    <div>
      <Text tag='div' weight='semibold' className='capitalize'>
        {paymentInstrument.data.card_type != null ? (
          <span>
            {paymentInstrument.data.card_type}{' '}
            {paymentInstrument.data.issuer_type}
            <Spacer left='2' style={{ display: 'inline-block' }}>
              ··{paymentInstrument.data.card_last_digits}
            </Spacer>
          </span>
        ) : (
          paymentInstrument.data.issuer_type
        )}
      </Text>
      <Text size='small' tag='div' variant='info' weight='medium'>
        {paymentMethodName}
      </Text>
    </div>
  ) : (
    <div>
      <Text tag='div' weight='semibold'>
        {paymentMethodName}
      </Text>
    </div>
  )
}

const paymentInstrumentType = z.object({
  issuer_type: z.string(),
  card_type: z
    .string()
    .optional()
    .transform((brand) => {
      if (brand == null) {
        return brand
      }

      return brand
        .toLowerCase()
        .split(' ')
        .map((word) => {
          const firstLetter = word.charAt(0).toUpperCase()
          const rest = word.slice(1).toLowerCase()

          return firstLetter + rest
        })
        .join(' ')
    }),
  card_last_digits: z.string().optional(),
  card_expiry_month: z.string().optional(),
  card_expiry_year: z.string().optional()
})

const paymentMethodsType = z.object({
  paymentMethods: z.array(
    z.object({
      name: z.string()
    })
  )
})
