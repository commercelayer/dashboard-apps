import { subscriptionFailedOnLastRun } from '#utils/subscriptionFailedOnLastRun'
import type { BadgeProps } from '@commercelayer/app-elements'
import {
  Badge,
  Spacer,
  Stack,
  Text,
  formatDate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'

interface Props {
  subscription: OrderSubscription
}

function getSubscriptionStatusBadgeVariant(
  status: OrderSubscription['status']
): BadgeProps['variant'] {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
    case 'draft':
    case 'cancelled':
      return 'secondary'
  }
}

function getSubscriptionStatusName(
  status: OrderSubscription['status']
): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'inactive':
      return 'Inactive'
    case 'draft':
      return 'Draft'
    case 'cancelled':
      return 'Cancelled'
  }
}

export const SubscriptionSteps = withSkeletonTemplate<Props>(
  ({ subscription }): JSX.Element => {
    const { user } = useTokenProvider()

    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Status
            </Text>
          </Spacer>
          {subscription.status !== undefined && (
            <Badge
              variant={getSubscriptionStatusBadgeVariant(subscription.status)}
            >
              {getSubscriptionStatusName(subscription.status)}
            </Badge>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Last run
            </Text>
          </Spacer>
          <div className='flex items-center gap-2'>
            <Text>
              {formatDate({
                isoDate: subscription.last_run_at ?? '',
                format: 'full',
                timezone: user?.timezone
              })}
            </Text>
            {subscriptionFailedOnLastRun(subscription) && (
              <Badge variant='danger'>Failed</Badge>
            )}
          </div>
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Next run
            </Text>
          </Spacer>
          <Text>
            {subscription.status !== 'cancelled' ? (
              formatDate({
                isoDate: subscription.next_run_at ?? '',
                format: 'full',
                timezone: user?.timezone
              })
            ) : (
              <Text data-testid='empty-string' variant='disabled'>
                &#8212;
              </Text>
            )}
          </Text>
        </div>
      </Stack>
    )
  }
)
