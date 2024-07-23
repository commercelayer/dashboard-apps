import { useActiveStockTransfers } from '#hooks/useActiveStockTransfers'
import {
  Badge,
  getShipmentDisplayStatus,
  Spacer,
  Stack,
  Text,
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

    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Status
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
                      Awaiting stock transfers
                    </Text>
                  </div>
                )}
            </>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Origin
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
