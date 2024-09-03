import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Icon,
  ListItem,
  Section,
  StatusIcon,
  Text,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useEditCustomerOverlay } from './NewOrder/hooks/useEditCustomerOverlay'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const {
      canAccess,
      canUser,
      settings: { mode }
    } = useTokenProvider()

    const { mutateOrder } = useOrderDetails(order.id)
    const { Overlay: EditCustomerOverlay, open: openEditCustomerOverlay } =
      useEditCustomerOverlay(order, () => {
        void mutateOrder()
      })

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

    const canUserUpdateCustomers = canUser('update', 'customers')

    return (
      <>
        <EditCustomerOverlay />
        <Section
          title='Customer'
          actionButton={
            canUserUpdateCustomers ? (
              <Button
                alignItems='center'
                variant='secondary'
                size='mini'
                onClick={() => {
                  openEditCustomerOverlay()
                }}
              >
                <Icon name='pencilSimple' />
                Edit
              </Button>
            ) : null
          }
        >
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
      </>
    )
  }
)
