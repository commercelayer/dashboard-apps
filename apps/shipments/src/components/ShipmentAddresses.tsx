import {
  ResourceAddress,
  Section,
  Stack,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentAddresses = withSkeletonTemplate<Props>(
  ({ shipment }): JSX.Element | null => {
    if (shipment.shipping_address == null && shipment.origin_address == null) {
      return null
    }

    return (
      <Section title='Addresses' border='none'>
        <Stack>
          {shipment.origin_address != null && (
            <ResourceAddress
              resource={shipment.origin_address}
              title='Ship from'
            />
          )}
          {shipment.shipping_address != null && (
            <ResourceAddress
              resource={shipment.shipping_address}
              title='Ship to'
            />
          )}
        </Stack>
      </Section>
    )
  }
)
