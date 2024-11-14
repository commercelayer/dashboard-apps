import {
  Section,
  Spacer,
  Text,
  useResourceList,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { ListItemSubscriptionItem } from './ListItemSubscriptionItem'

interface Props {
  subscriptionId: string
}

export const SubscriptionItems = withSkeletonTemplate<Props>(
  ({ subscriptionId }): JSX.Element | null => {
    const { ResourceList } = useResourceList({
      type: 'order_subscription_items',
      query: {
        filters: {
          order_subscription_id_eq: subscriptionId
        },
        include: ['sku']
      }
    })

    return (
      <>
        <Spacer top='14'>
          <Section title='Items'>
            <ResourceList
              emptyState={
                <Spacer top='4'>
                  <Text variant='info'>No items.</Text>
                </Spacer>
              }
              titleSize='normal'
              ItemTemplate={ListItemSubscriptionItem}
            />
          </Section>
        </Spacer>
      </>
    )
  }
)
