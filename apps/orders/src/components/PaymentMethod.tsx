import { Spacer, Text } from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'
import { z } from 'zod'

interface Props {
  order: SetRequired<SetNonNullable<Order, 'payment_method'>, 'payment_method'>
}

export function PaymentMethod({ order }: Props): JSX.Element {
  const paymentInstrument = paymentInstrumentType.safeParse(
    order.payment_source?.payment_instrument
  )

  return paymentInstrument.success ? (
    <div>
      <Text tag='div' weight='semibold'>
        {paymentInstrument.data.card_type != null ? (
          <span>
            {paymentInstrument.data.card_type}{' '}
            {paymentInstrument.data.issuer_type}
            {paymentInstrument.data.card_last_digits != null && (
              <Spacer left='2' style={{ display: 'inline-block' }}>
                ··{paymentInstrument.data.card_last_digits}
              </Spacer>
            )}
          </span>
        ) : (
          paymentInstrument.data.issuer_type
        )}
      </Text>
      <Text size='small' tag='div' variant='info' weight='medium'>
        {order.payment_method.name}
      </Text>
    </div>
  ) : (
    <div>
      <Text tag='div' weight='semibold'>
        {order.payment_method.name}
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

export function hasPaymentMethod(
  order: Order
): order is SetRequired<
  SetNonNullable<Order, 'payment_method'>,
  'payment_method'
> {
  return order.payment_method?.name != null
}
