import {
  Badge,
  Spacer,
  Stack,
  Text,
  getReturnDisplayStatus,
  withSkeletonTemplate,
  type BadgeProps
} from '@commercelayer/app-elements'

import type { Return } from '@commercelayer/sdk'

interface Props {
  returnObj: Return
}

function getReturnStatusBadgeVariant(
  status: Return['status']
): BadgeProps['variant'] {
  switch (status) {
    case 'received':
    case 'refunded':
      return 'success-solid'
    case 'draft':
    case 'cancelled':
      return 'secondary'
    case 'rejected':
      return 'danger'
    case 'requested':
    case 'approved':
    case 'shipped':
      return 'warning-solid'
  }
}

export const ReturnSteps = withSkeletonTemplate<Props>(
  ({ returnObj }): JSX.Element => {
    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Status
            </Text>
          </Spacer>
          {returnObj.status !== undefined && (
            <Badge
              variant={getReturnStatusBadgeVariant(returnObj.status)}
              className='mt-1'
            >
              {getReturnDisplayStatus(returnObj).label.toUpperCase()}
            </Badge>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Destination
            </Text>
          </Spacer>
          <Text weight='semibold' className='text-lg'>
            {returnObj?.stock_location?.name}
          </Text>
        </div>
      </Stack>
    )
  }
)
