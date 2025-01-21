import { makeOrder } from '#mocks'
import {
  ResourceListItem,
  useAppLinking,
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
  const { canAccess } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const navigateToOrder = canAccess('orders')
    ? navigateTo({
        app: 'orders',
        resourceId: resource.id
      })
    : {}

  return <ResourceListItem resource={resource} {...navigateToOrder} />
}

export const ListItemOrder = withSkeletonTemplate(ListItemOrderComponent)
