import {
  ListItem,
  ResourceAddress,
  Section,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element | null => {
    const { canUser } = useTokenProvider()
    const { t } = useTranslation()

    const addresses = customer.customer_addresses?.map(
      (customerAddress, idx) =>
        customerAddress?.address != null ? (
          <ListItem key={idx}>
            <ResourceAddress
              address={customerAddress?.address}
              editable={canUser('update', 'addresses')}
              showBillingInfo
            />
          </ListItem>
        ) : null
    )

    if (addresses?.length === 0) return <></>

    return (
      <Section title={t('resources.addresses.name_other')}>{addresses}</Section>
    )
  }
)
