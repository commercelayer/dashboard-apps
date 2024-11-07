import { ListItemSubscriptionOrder } from '#components/ListItemSubscriptionOrder'
import {
  Section,
  Td,
  Tr,
  useResourceList,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionOrders = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    const { ResourceList } = useResourceList({
      type: 'orders',
      query: {
        filters: {
          order_subscription_id_eq: subscription.id,
          status_eq: 'placed'
        },
        sort: ['-placed_at']
      }
    })

    return (
      <Section title='Recurring orders' border='none'>
        <ResourceList
          variant='table'
          headings={[
            {
              label: 'DATE'
            },
            {
              label: 'ORDER',
              align: 'left'
            },
            {
              label: 'PAYMENT STATUS'
            }
          ]}
          emptyState={
            <Tr>
              <Td colSpan={3}>no results</Td>
            </Tr>
          }
          ItemTemplate={ListItemSubscriptionOrder}
        />
      </Section>
    )
  }
)
