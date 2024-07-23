import { makeShipment } from '#mocks'
import {
  ResourceListItem,
  navigateTo,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Shipment } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

export const ListItemShipment = withSkeletonTemplate<{
  resource?: Shipment
}>(({ resource = makeShipment(), delayMs, isLoading }) => {
  const [, setLocation] = useLocation()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'shipments',
          resourceId: resource.id
        }
      })}
    />
  )
})
