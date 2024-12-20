import {
  ResourceAddress,
  Section,
  Stack,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentAddresses = withSkeletonTemplate<Props>(
  ({ shipment }): JSX.Element | null => {
    const { t } = useTranslation()
    if (shipment.shipping_address == null && shipment.origin_address == null) {
      return null
    }

    return (
      <Section title={t('resources.addresses.name_other')} border='none'>
        <Stack>
          {shipment.origin_address != null && (
            <ResourceAddress
              address={shipment.origin_address}
              title={t('apps.shipments.details.ship_from')}
            />
          )}
          {shipment.shipping_address != null && (
            <ResourceAddress
              address={shipment.shipping_address}
              title={t('apps.shipments.details.ship_to')}
            />
          )}
        </Stack>
      </Section>
    )
  }
)
