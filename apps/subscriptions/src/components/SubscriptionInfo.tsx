import { getFrequencyLabelByValue } from '#data/frequencies'
import { makeOrderSubscription } from '#mocks'
import {
  ListDetailsItem,
  navigateTo,
  Section,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'
import type { FC } from 'react'

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionInfo: FC<Props> = ({
  subscription = makeOrderSubscription()
}) => {
  const {
    canAccess,
    settings: { mode }
  } = useTokenProvider()

  const subscriptionCustomerEmail = subscription?.customer_email
  const navigateToCustomer = canAccess('customers')
    ? navigateTo({
        destination: {
          app: 'customers',
          resourceId: subscription?.customer?.id,
          mode
        }
      })
    : {}

  const subscriptionOrderNumber = `#${subscription.source_order?.number}`
  const navigateToOrder = canAccess('orders')
    ? navigateTo({
        destination: {
          app: 'orders',
          resourceId: subscription.source_order?.id,
          mode
        }
      })
    : {}

  return (
    <Section title='Info'>
      <ListDetailsItem label='Frequency' gutter='none'>
        <Text tag='div' weight='semibold'>
          {getFrequencyLabelByValue(subscription.frequency)}
        </Text>
      </ListDetailsItem>
      <ListDetailsItem label='Customer' gutter='none'>
        {canAccess('customers') ? (
          <a {...navigateToCustomer}>{subscriptionCustomerEmail}</a>
        ) : (
          subscriptionCustomerEmail
        )}
      </ListDetailsItem>
      <ListDetailsItem label='Source order' gutter='none'>
        {canAccess('orders') ? (
          <a {...navigateToOrder}>{`${subscriptionOrderNumber}`}</a>
        ) : (
          `${subscriptionOrderNumber}`
        )}
      </ListDetailsItem>
    </Section>
  )
}
