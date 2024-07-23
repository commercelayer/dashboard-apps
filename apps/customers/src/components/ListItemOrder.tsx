import { makeOrder } from '#mocks'
import {
  ResourceListItem,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  resource?: Order
}

function ListItemOrderComponent({
  resource = makeOrder()
}: Props): JSX.Element {
  const {
    canAccess,
    settings: { mode }
  } = useTokenProvider()

  const navigateToOrder = canAccess('orders')
    ? navigateTo({
        destination: {
          app: 'orders',
          resourceId: resource.id,
          mode
        }
      })
    : {}

  return <ResourceListItem resource={resource} {...navigateToOrder} />
}

export const ListItemOrder = withSkeletonTemplate(ListItemOrderComponent)
