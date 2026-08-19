import {
  Badge,
  Button,
  formatDate,
  Stack,
  StackCell,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { OrderSubscription } from "@commercelayer/sdk"
import { getFrequencyLabelByValue } from "#data/frequencies"
import { subscriptionFailedOnLastRun } from "#utils/subscriptionFailedOnLastRun"

interface Props {
  subscription: OrderSubscription
}

/**
 * The renewal schedule and what the subscription came from.
 *
 * Two stacks rather than one long one: consecutive stacks pull themselves
 * together into a single grid (`not-first:-mt-px`). The first row is the schedule,
 * the second what the subscription came from.
 */
export const SubscriptionInfo = withSkeletonTemplate<Props>(
  ({ subscription }): React.JSX.Element => {
    const { canAccess, user } = useTokenProvider()
    const { navigateTo } = useAppLinking()

    const sourceOrder = subscription.source_order
    const navigateToOrder =
      canAccess("orders") && sourceOrder?.id != null
        ? navigateTo({ app: "orders", resourceId: sourceOrder.id })
        : {}

    const navigateToCustomer =
      canAccess("customers") && subscription.customer?.id != null
        ? navigateTo({ app: "customers", resourceId: subscription.customer.id })
        : {}

    return (
      <>
        <Stack size="small">
          <StackCell label="Frequency">
            {getFrequencyLabelByValue(subscription.frequency)}
          </StackCell>
          <StackCell label="Last run">
            {subscription.last_run_at == null ? undefined : (
              <div className="flex items-center gap-2">
                {formatDate({
                  format: "full",
                  isoDate: subscription.last_run_at,
                  timezone: user?.timezone,
                  locale: user?.locale,
                })}
                {subscriptionFailedOnLastRun(subscription) && (
                  <Badge variant="danger">Failed</Badge>
                )}
              </div>
            )}
          </StackCell>
        </Stack>
        {/* on its own row: five cells do not pair up, and pairing this with the
            source order below would mix the schedule with the relations */}
        <Stack size="small">
          <StackCell label="Next run">
            {/* a cancelled subscription will not run again */}
            {subscription.status === "cancelled" ||
            subscription.next_run_at == null
              ? undefined
              : formatDate({
                  format: "full",
                  isoDate: subscription.next_run_at,
                  timezone: user?.timezone,
                  locale: user?.locale,
                })}
          </StackCell>
        </Stack>
        <Stack size="small">
          <StackCell label="Source order">
            {sourceOrder?.number == null ? undefined : canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                #{sourceOrder.number}
              </Button>
            ) : (
              `#${sourceOrder.number}`
            )}
          </StackCell>
          <StackCell label="Customer">
            {subscription.customer_email == null ? undefined : canAccess(
                "customers",
              ) ? (
              <Button variant="link" {...navigateToCustomer}>
                {subscription.customer_email}
              </Button>
            ) : (
              subscription.customer_email
            )}
          </StackCell>
        </Stack>
      </>
    )
  },
)
