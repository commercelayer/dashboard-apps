import { getFrequencyLabelByValue } from '#data/frequencies'
import { makeOrderSubscription } from '#mocks'
import {
  ListDetailsItem,
  Section,
  Text,
  useAppLinking,
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
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const subscriptionCustomerEmail = subscription?.customer_email
  const navigateToCustomer = canAccess('customers')
    ? navigateTo({
        app: 'customers',
        resourceId: subscription?.customer?.id
      })
    : {}

  const subscriptionOrderNumber = `#${subscription.source_order?.number}`
  const navigateToOrder = canAccess('orders')
    ? navigateTo({
        app: 'orders',
        resourceId: subscription.source_order?.id
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
