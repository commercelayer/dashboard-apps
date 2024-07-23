import {
  ListItem,
  Section,
  Text,
  getCustomerStatusName,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerInfo = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element => {
    return (
      <Section title='Info'>
        <ListItem padding='y'>
          <Text tag='div' variant='info'>
            Status
          </Text>
          <Text tag='div' weight='semibold' className='capitalize'>
            {getCustomerStatusName(customer?.status)}
          </Text>
        </ListItem>
        <ListItem padding='y'>
          <Text tag='div' variant='info'>
            Group
          </Text>
          <Text tag='div' weight='semibold' className='capitalize'>
            {customer?.customer_group?.name ?? (
              <Text className='text-gray-300'>&#8212;</Text>
            )}
          </Text>
        </ListItem>
      </Section>
    )
  }
)
