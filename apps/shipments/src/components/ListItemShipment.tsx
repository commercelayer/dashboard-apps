import { makeShipment } from '#mocks'
import {
  ResourceListItem,
  useAppLinking,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Shipment } from '@commercelayer/sdk'

export const ListItemShipment = withSkeletonTemplate<{
  resource?: Shipment
}>(({ resource = makeShipment(), delayMs, isLoading }) => {
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        app: 'shipments',
        resourceId: resource.id
      })}
    />
  )
})
