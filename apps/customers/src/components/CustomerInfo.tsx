import {
  ListDetailsItem,
  Section,
  Text,
  formatDateWithPredicate,
  getCustomerStatusName,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerInfo = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element => {
    const { user } = useTokenProvider()

    return (
      <Section title='Info'>
        <ListDetailsItem label='Type' gutter='none'>
          <Text tag='div' weight='semibold'>
            {customer?.has_password === true ? 'Registered' : 'Guest'}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem label='Status' gutter='none'>
          <Text tag='div' weight='semibold' className='capitalize'>
            {getCustomerStatusName(customer?.status)}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem label='Group' gutter='none'>
          <Text tag='div' weight='semibold'>
            {customer?.customer_group?.name ?? (
              <Text className='text-gray-300'>&#8212;</Text>
            )}
          </Text>
        </ListDetailsItem>
        {customer.customer_subscriptions != null &&
          customer.customer_subscriptions.length > 0 && (
            <ListDetailsItem label='Newsletter' gutter='none'>
              <Text tag='div' weight='semibold'>
                {formatDateWithPredicate({
                  predicate: 'Subscribed',
                  isoDate: customer.customer_subscriptions[0]?.created_at ?? '',
                  timezone: user?.timezone
                })}
              </Text>
            </ListDetailsItem>
          )}
      </Section>
    )
  }
)
