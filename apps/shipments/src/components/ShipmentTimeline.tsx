import { useShipmentDetails } from '#hooks/useShipmentDetails'
import {
  Legend,
  ResourceOrderTimeline,
  Spacer,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentTimeline = withSkeletonTemplate<Props>(({ shipment }) => {
  const { isValidating } = useShipmentDetails(shipment.id)
  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <ResourceOrderTimeline
          orderId={shipment.order?.id}
          refresh={isValidating}
          attachmentOption={{
            referenceOrigin: 'app-shipments--note'
          }}
        />
      </Spacer>
    </>
  )
})
