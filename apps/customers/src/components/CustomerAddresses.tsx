import {
  ListItem,
  ResourceAddress,
  Section,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element | null => {
    const { canUser } = useTokenProvider()

    const addresses = customer.customer_addresses?.map(
      (customerAddress, idx) =>
        customerAddress?.address != null ? (
          <ListItem key={idx}>
            <ResourceAddress
              resource={customerAddress?.address}
              editable={canUser('update', 'addresses')}
              showBillingInfo
            />
          </ListItem>
        ) : null
    )

    if (addresses?.length === 0) return <></>

    return <Section title='Addresses'>{addresses}</Section>
  }
)
