import {
  Alert,
  Badge,
  Button,
  EmptyState,
  formatDateWithPredicate,
  type PageHeadingProps,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useLocation, useRoute } from "wouter"
import { SubscriptionAddresses } from "#components/SubscriptionAddresses"
import { SubscriptionInfo } from "#components/SubscriptionInfo"
import { SubscriptionItems } from "#components/SubscriptionItems"
import { SubscriptionOrders } from "#components/SubscriptionOrders"
import { SubscriptionPayment } from "#components/SubscriptionPayment"
import {
  getOrderSubscriptionTriggerAction,
  getOrderSubscriptionTriggerActionName,
  getSubscriptionStatusBadgeVariant,
  getSubscriptionStatusName,
} from "#data/dictionaries"
import { appRoutes } from "#data/routes"
import { useSubscriptionDetails } from "#hooks/useSubscriptionDetails"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"
import { getSubscriptionTitle } from "#utils/getSubscriptionTitle"

function SubscriptionDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
    user,
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { goBack } = useAppLinking()

  const [, params] = useRoute<{ subscriptionId: string }>(
    appRoutes.details.path,
  )

  const subscriptionId = params?.subscriptionId ?? ""
  const { dispatch } = useTriggerAttribute(subscriptionId)

  const { subscription, isLoading, error, mutateSubscription } =
    useSubscriptionDetails(subscriptionId)

  if (
    subscriptionId === undefined ||
    !canUser("read", "order_subscriptions") ||
    error != null
  ) {
    return (
      <PageLayout
        title="Subscriptions"
        navigationButton={{
          onClick: () => {
            goBack({
              currentResourceId: subscriptionId,
              defaultRelativePath: appRoutes.list.makePath({}),
            })
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        mode={mode}
        scrollToTop
      >
        <EmptyState
          title="Not authorized"
          action={
            <Button
              variant="primary"
              onClick={() => {
                goBack({
                  currentResourceId: subscriptionId,
                  defaultRelativePath: appRoutes.list.makePath({}),
                })
              }}
            >
              Go back
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = getSubscriptionTitle(subscription)

  // A subscription becomes `pending` when its payment method requires a saved
  // wallet for renewals but none is available (see core-api#3292). It resolves
  // to `active` once a payment source is attached and activation is triggered.
  // @ts-expect-error `pending` is not yet in the SDK status union (beta.9)
  const isPending = subscription.status === "pending"

  const pageToolbar: PageHeadingProps["toolbar"] = canUser(
    "update",
    "order_subscriptions",
  )
    ? {
        buttons: [],
        dropdownItems: [],
      }
    : undefined

  if (
    canUser("update", "order_subscriptions") &&
    subscription.status !== "cancelled"
  ) {
    const triggerAction = getOrderSubscriptionTriggerAction(subscription)
    const showMainAction =
      subscription.status === "active" ||
      subscription.status === "inactive" ||
      // @ts-expect-error `pending` is not yet in the SDK status union (beta.9)
      subscription.status === "pending"

    if (showMainAction) {
      pageToolbar?.buttons?.push({
        label:
          triggerAction?.triggerAttribute != null
            ? getOrderSubscriptionTriggerActionName(
                triggerAction?.triggerAttribute,
              )
            : "",
        size: "small",
        variant: "primary",
        onClick: () => {
          if (triggerAction != null) {
            void dispatch(triggerAction.triggerAttribute)
          }
        },
      })
    }
    pageToolbar?.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(appRoutes.edit.makePath({ subscriptionId }))
        },
      },
    ])
    pageToolbar?.dropdownItems?.push([
      {
        label: "Cancel subscription",
        onClick: () => {
          void dispatch("_cancel")
        },
      },
    ])
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "order_subscriptions",
      subscription.id,
      extras,
    )
    pageToolbar?.buttons?.push(resourceInspectorButton)
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {pageTitle}{" "}
          <Badge
            variant={getSubscriptionStatusBadgeVariant(subscription.status)}
          >
            {getSubscriptionStatusName(subscription.status)}
          </Badge>
        </SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: "Updated",
              isoDate: subscription.updated_at ?? "",
              timezone: user?.timezone,
            })}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: subscription.id,
            defaultRelativePath: appRoutes.list.makePath({}),
          })
        },
        label: "",
        icon: "arrowLeft",
        variant: "button",
      }}
      gap="only-top"
      scrollToTop
      fullWidth
      alert={
        !isLoading &&
        isPending && (
          <Alert status="warning">
            This subscription is <b>pending</b> because it has no usable payment
            method for renewals. Attach a payment source, then activate it to
            resume.
          </Alert>
        )
      }
      sidebar={
        <SkeletonTemplate isLoading={isLoading}>
          <SubscriptionAddresses subscription={subscription} />
          <div className="mt-14 lg:mt-10">
            <ResourceInfoBlocks
              resource={subscription}
              title={pageTitle}
              onUpdated={async () => {
                void mutateSubscription()
              }}
              onTagClick={(tagId) => {
                setLocation(appRoutes.home.makePath({}, `tags_id_in=${tagId}`))
              }}
            />
          </div>
        </SkeletonTemplate>
      }
      // stays last at every width: stacked, it follows the sidebar instead of
      // letting the sidebar sink to the bottom of the page
    >
      <SkeletonTemplate isLoading={isLoading}>
            <SubscriptionInfo subscription={subscription} />
          <Spacer top="14">
            <SubscriptionItems subscriptionId={subscription.id} />
          </Spacer>
          {/* in the main column, after the items, as it was before the sidebar */}
          <Spacer top="14">
            <SubscriptionPayment subscription={subscription} />
        </Spacer>
        <Spacer top="14" bottom="4">
          <SubscriptionOrders subscription={subscription} />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default SubscriptionDetails
