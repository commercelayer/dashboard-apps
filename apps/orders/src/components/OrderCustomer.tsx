import {
  ListItem,
  Section,
  StatusIcon,
  Text,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const {
      canAccess,
      settings: { mode }
    } = useTokenProvider()

    if (order.customer == null) {
      return null
    }

    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          destination: {
            app: 'customers',
            resourceId: order.customer.id,
            mode
          }
        })
      : {}

    return (
      <Section title='Customer'>
        <ListItem
          icon={<StatusIcon name='user' background='teal' gap='large' />}
          {...navigateToCustomer}
        >
          <div>
            <Text tag='div' weight='semibold'>
              {order.customer.email}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              {order.customer.total_orders_count} orders
            </Text>
          </div>
          {canAccess('customers') && <StatusIcon name='caretRight' />}
        </ListItem>
      </Section>
    )
  }
)
