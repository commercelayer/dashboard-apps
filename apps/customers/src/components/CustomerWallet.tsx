import {
  Icon,
  ResourcePaymentMethod,
  Section,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer, CustomerPaymentSource } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'

interface Props {
  customer: Customer
  onRemovedPaymentSource?: () => void
}

export const CustomerWallet = withSkeletonTemplate<Props>(
  ({ customer, onRemovedPaymentSource }) => {
    const { t } = useTranslation()
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()

    const customerPaymentSources = customer?.customer_payment_sources?.map(
      (customerPaymentSource, idx) => {
        return hasPaymentSource(customerPaymentSource) ? (
          <Spacer key={idx} bottom='4'>
            <ResourcePaymentMethod
              resource={customerPaymentSource}
              actionButton={
                canUser('destroy', 'customer_payment_sources') ? (
                  <button
                    onClick={() => {
                      void sdkClient.customer_payment_sources
                        .delete(customerPaymentSource.id)
                        .then(() => {
                          if (onRemovedPaymentSource != null) {
                            onRemovedPaymentSource()
                          }
                        })
                    }}
                  >
                    <Icon name='trash' size={18} />
                  </button>
                ) : null
              }
            />
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
  }
)

export function hasPaymentSource(
  customerPaymentSource: CustomerPaymentSource
): customerPaymentSource is SetRequired<
  SetNonNullable<CustomerPaymentSource, 'payment_source'>,
  'payment_source'
> {
  return customerPaymentSource.payment_source != null
}
