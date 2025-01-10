import {
  ResourcePaymentMethod,
  Section,
  Spacer,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer, CustomerPaymentSource } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'

interface Props {
  customer: Customer
}

export const CustomerWallet = withSkeletonTemplate<Props>(({ customer }) => {
  const { t } = useTranslation()
  const customerPaymentSources = customer?.customer_payment_sources?.map(
    (customerPaymentSource, idx) => {
      return hasPaymentSource(customerPaymentSource) ? (
        <Spacer key={idx} bottom='4'>
          <ResourcePaymentMethod resource={customerPaymentSource} />
        </Spacer>
      ) : null
    }
  )

  if (customerPaymentSources?.length === 0) return <></>

  return (
    <Section title={t('apps.customers.details.wallet')} border='none'>
      {customerPaymentSources}
    </Section>
  )
})

export function hasPaymentSource(
  customerPaymentSource: CustomerPaymentSource
): customerPaymentSource is SetRequired<
  SetNonNullable<CustomerPaymentSource, 'payment_source'>,
  'payment_source'
> {
  return customerPaymentSource.payment_source != null
}
