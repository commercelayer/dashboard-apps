import { useActiveStockTransfers } from '#hooks/useActiveStockTransfers'
import {
  Badge,
  getShipmentDisplayStatus,
  Spacer,
  Stack,
  Text,
  useTranslation,
  withSkeletonTemplate,
  type BadgeProps
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentSteps = withSkeletonTemplate<Props>(
  ({ shipment }): JSX.Element => {
    const displayStatus = getShipmentDisplayStatus(shipment)
    const activeStockTransfers = useActiveStockTransfers(shipment)
    const { t } = useTranslation()

    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              {t('apps.shipments.attributes.status')}
            </Text>
          </Spacer>
          {shipment.status !== undefined && (
            <>
              <Badge variant={getBadgeVariant(shipment)}>
                {displayStatus.label.toUpperCase()}
              </Badge>
              {shipment.status === 'on_hold' &&
                activeStockTransfers.length > 0 && (
                  <div className='mt-2'>
                    <Text variant='warning' size='small' weight='semibold'>
                      {t('apps.shipments.details.awaiting_stock_transfers')}
                    </Text>
                  </div>
                )}
            </>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              {t('apps.shipments.details.origin')}
            </Text>
          </Spacer>
          <Text weight='semibold' className='text-[18px]'>
            {shipment.stock_location?.name}
          </Text>
        </div>
      </Stack>
    )
  }
)

function getBadgeVariant(shipment: Shipment): BadgeProps['variant'] {
  switch (shipment.status) {
    case 'picking':
    case 'packing':
    case 'ready_to_ship':
    case 'on_hold':
      return 'warning-solid'

    case 'delivered':
    case 'shipped':
      return 'success-solid'

    default:
      return 'secondary-solid'
  }
}
