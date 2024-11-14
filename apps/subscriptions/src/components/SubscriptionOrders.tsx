import { ListItemSubscriptionOrder } from '#components/ListItemSubscriptionOrder'
import { appRoutes } from '#data/routes'
import {
  Button,
  Icon,
  Section,
  Table,
  Td,
  Th,
  Tr,
  useResourceList,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  subscription: OrderSubscription
}

export const SubscriptionOrders = withSkeletonTemplate<Props>(
  ({ subscription }) => {
    const { list, meta } = useResourceList({
      type: 'orders',
      query: {
        filters: {
          order_subscription_id_eq: subscription.id,
          status_in: ['placed', 'pending']
        },
        sort: ['-updated_at'],
        pageSize: 5
      }
    })

    const showAll = meta != null ? meta.pageCount > 1 : false
    const [, setLocation] = useLocation()
    const noResults = meta != null ? meta.recordCount === 0 : true

    return (
      <Section
        title={`Recurring orders · ${meta?.recordCount}`}
        border='none'
        actionButton={
          showAll && (
            <Button
              variant='secondary'
              size='mini'
              onClick={() => {
                setLocation(
                  appRoutes.orders.makePath({ subscriptionId: subscription.id })
                )
              }}
              alignItems='center'
            >
              <Icon name='eye' size={16} />
              See all
            </Button>
          )
        }
      >
        <Table
          thead={
            <Tr>
              <Th>Date</Th>
              <Th>Order</Th>
              <Th>Result</Th>
            </Tr>
          }
          tbody={
            noResults ? (
              <Tr>
                <Td colSpan={3}>no results</Td>
              </Tr>
            ) : (
              list?.map((order, idx) => (
                <ListItemSubscriptionOrder resource={order} key={idx} />
              ))
            )
          }
        />
      </Section>
    )
  }
)
