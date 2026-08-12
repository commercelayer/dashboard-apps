import {
  Badge,
  Button,
  formatDate,
  Spacer,
  Stack,
  Text,
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
        <Stack>
          <InfoCell label="Frequency">
            {getFrequencyLabelByValue(subscription.frequency) ?? <EmptyValue />}
          </InfoCell>
          <InfoCell label="Last run">
            {subscription.last_run_at == null ? (
              <EmptyValue />
            ) : (
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
          </InfoCell>
          <InfoCell label="Next run">
            {/* a cancelled subscription will not run again */}
            {subscription.status === "cancelled" ||
            subscription.next_run_at == null ? (
              <EmptyValue />
            ) : (
              formatDate({
                format: "full",
                isoDate: subscription.next_run_at,
                timezone: user?.timezone,
                locale: user?.locale,
              })
            )}
          </InfoCell>
        </Stack>
        <Stack>
          <InfoCell label="Source order">
            {sourceOrder?.number == null ? (
              <EmptyValue />
            ) : canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                #{sourceOrder.number}
              </Button>
            ) : (
              `#${sourceOrder.number}`
            )}
          </InfoCell>
          <InfoCell label="Customer">
            {subscription.customer_email == null ? (
              <EmptyValue />
            ) : canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {subscription.customer_email}
              </Button>
            ) : (
              subscription.customer_email
            )}
          </InfoCell>
        </Stack>
      </>
    )
  },
)

/** One cell of the stack: a muted label above the value. */
function InfoCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div>
      <Spacer bottom="2">
        <Text size="small" tag="div" variant="info" weight="semibold">
          {label}
        </Text>
      </Spacer>
      <Text tag="div" weight="semibold">
        {children}
      </Text>
    </div>
  )
}

function EmptyValue(): React.JSX.Element {
  return <Text className="text-gray-300">&#8212;</Text>
}
