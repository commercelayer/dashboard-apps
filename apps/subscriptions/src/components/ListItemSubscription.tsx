import { getOrderSubscriptionStatus } from '#data/dictionaries'
import { makeOrderSubscription } from '#mocks'
import {
  formatDate,
  Hint,
  ListItem,
  StatusIcon,
  Text,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { OrderSubscription } from '@commercelayer/sdk'

/**
 * Get the relative status based on orderSubscriptions's circuit state {@link https://docs.commercelayer.io/core/v/api-reference/order_subscriptions/object}
 * @param orderSubscriptions - The orderSubscriptions object.
 * @returns a valid StatusUI to be used in the StatusIcon component.
 */
function getListUiIcon(
  orderSubscriptions: OrderSubscription
): JSX.Element | undefined {
  const status = getOrderSubscriptionStatus(orderSubscriptions)
  switch (status) {
    case 'active':
      return <StatusIcon name='pulse' gap='large' background='green' />
    case 'inactive':
      return <StatusIcon name='minus' gap='large' background='gray' />
    case 'cancelled':
      return <StatusIcon name='x' gap='large' background='gray' />
    case 'failed':
      return <StatusIcon name='x' gap='large' background='red' />
    default:
      return undefined
  }
}

interface ListItemSubscriptionProps {
  resource?: OrderSubscription
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSubscription =
  withSkeletonTemplate<ListItemSubscriptionProps>(
    ({ resource = makeOrderSubscription() }) => {
      const { user } = useTokenProvider()
      const lastRunFailed =
        resource.succeeded_on_last_run === false && resource.last_run_at != null
      const status = lastRunFailed ? 'Last run failed' : resource.status
      const date = formatDate({
        isoDate: resource.updated_at,
        format: 'date',
        timezone: user?.timezone,
        showCurrentYear: true
      })

      return (
        <ListItem alignItems='center' icon={getListUiIcon(resource)}>
          <div>
            <Text weight='bold'>
              {resource?.market?.name} #{resource.number}
            </Text>
            <Hint>
              {date} · {resource.customer_email} ·{' '}
              <Text variant={lastRunFailed ? 'danger' : 'info'}>{status}</Text>
            </Hint>
          </div>
        </ListItem>
      )
    }
  )
