import {
  formatDate,
  Icon,
  ListItem,
  StatusIcon,
  Text,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { OrderSubscription } from "@commercelayer/sdk"
import { Link } from "wouter"
import { appRoutes } from "#data/routes"
import { makeOrderSubscription } from "#mocks"
import { getSubscriptionStatus } from "#utils/getSubscriptionStatus"

/**
 * Get the relative status based on subscription's circuit state {@link https://docs.commercelayer.io/core/v/api-reference/order_subscriptions/object}
 * @param subscription - The subscription object.
 * @returns a valid StatusUI to be used in the StatusIcon component.
 */
function getListUiIcon(
  subscription: OrderSubscription,
): React.JSX.Element | undefined {
  const status = getSubscriptionStatus(subscription)
  switch (status) {
    case "active":
      return <StatusIcon name="pulse" gap="large" background="green" />
    case "pending":
      return <StatusIcon name="warning" gap="large" background="orange" />
    case "inactive":
      return <StatusIcon name="minus" gap="large" background="gray" />
    case "cancelled":
      return <StatusIcon name="x" gap="large" background="gray" />
    case "failed":
      return <StatusIcon name="x" gap="large" background="red" />
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
      const { navigateTo } = useAppLinking()

      // A `pending` subscription can also carry a failed last run; `pending`
      // takes precedence so it isn't masked as "Last run failed".
      // @ts-expect-error `pending` is not yet in the SDK status union (beta.9)
      const isPending = resource.status === "pending"
      const lastRunFailed =
        !isPending &&
        resource.succeeded_on_last_run === false &&
        resource.last_run_at != null
      const status = lastRunFailed ? "Last run failed" : resource.status
      const date = formatDate({
        isoDate: resource.updated_at,
        format: "date",
        timezone: user?.timezone,
        showCurrentYear: true,
      })

      return (
        <Link
          href={appRoutes.details.makePath({ subscriptionId: resource.id })}
          {...navigateTo({
            app: "subscriptions",
            resourceId: resource.id,
          })}
        >
          <ListItem alignItems="center" icon={getListUiIcon(resource)}>
            <div>
              <Text weight="bold">
                {resource?.market?.name} #{resource.number}
              </Text>
              <Text tag="div" variant="info" weight="medium" size="small">
                {date} · {resource.customer_email} ·{" "}
                <Text variant={lastRunFailed ? "danger" : "info"}>
                  {status}
                </Text>
              </Text>
            </div>
            <Icon name="caretRight" />
          </ListItem>
        </Link>
      )
    },
  )
