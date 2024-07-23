import {
  Badge,
  Spacer,
  Stack,
  Text,
  getStockTransferDisplayStatus,
  withSkeletonTemplate,
  type BadgeProps
} from '@commercelayer/app-elements'

import type { StockTransfer } from '@commercelayer/sdk'

interface Props {
  stockTransfer: StockTransfer
}

function getStockTransferStatusBadgeVariant(
  status: StockTransfer['status']
): BadgeProps['variant'] {
  switch (status) {
    case 'completed':
      return 'success-solid'
    case 'draft':
    case 'cancelled':
      return 'secondary'
    case 'on_hold':
      return 'danger'
    case 'upcoming':
    case 'picking':
    case 'in_transit':
      return 'warning-solid'
  }
}

export const StockTransferSteps = withSkeletonTemplate<Props>(
  ({ stockTransfer }): JSX.Element => {
    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Status
            </Text>
          </Spacer>
          {stockTransfer.status !== undefined && (
            <Badge
              variant={getStockTransferStatusBadgeVariant(stockTransfer.status)}
              className='mt-1'
            >
              {getStockTransferDisplayStatus(stockTransfer).label.toUpperCase()}
            </Badge>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Origin
            </Text>
          </Spacer>
          <Text weight='semibold' className='text-lg'>
            {stockTransfer?.origin_stock_location?.name}
          </Text>
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Destination
            </Text>
          </Spacer>
          <Text weight='semibold' className='text-lg'>
            {stockTransfer?.destination_stock_location?.name}
          </Text>
        </div>
      </Stack>
    )
  }
)
